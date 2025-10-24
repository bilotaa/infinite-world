uniform vec3 uPlayerPosition;
uniform float uLightnessSmoothness;
uniform float uFresnelOffset;
uniform float uFresnelScale;
uniform float uFresnelPower;
uniform vec3 uSunPosition;
uniform float uGrassDistance;
uniform sampler2D uTexture;
uniform sampler2D uFogTexture;
uniform sampler2D uGradientTexture;

varying vec3 vColor;

#include ../partials/inverseLerp.glsl
#include ../partials/remap.glsl
#include ../partials/getSunShade.glsl;
#include ../partials/getSunShadeColor.glsl;
#include ../partials/getSunReflection.glsl;
#include ../partials/getSunReflectionColor.glsl;
#include ../partials/getFogColor.glsl;
#include ../partials/getGrassAttenuation.glsl;
#include ../partials/getAmbientOcclusion.glsl;

// Road visual constants
const vec3 ROAD_COLOR = vec3(0.6, 0.6, 0.6);            // Much brighter grey
const vec3 LINE_COLOR = vec3(1.0, 1.0, 1.0);            // Pure white
const float ROAD_HALF_WIDTH = 8.0;                       // Half width of road (doubled)
const float CENTER_LINE_WIDTH = 1.0;                     // HUGE center line (4x wider)
const float EDGE_LINE_WIDTH = 0.8;                       // HUGE edge lines (3.2x wider)
const float DASH_LENGTH = 5.0;                           // Longer dashes
const float DASH_GAP = 2.0;
const float EDGE_LINE_POSITION = 7.0;                    // Distance from center
const float ROAD_CENTER_X = 0.0;
const float ROAD_SMOOTH_WIDTH = 0.5;                     // Sharp edges to match worker

float smoothStep(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
}

float getRoadInfluence(float x) {
    float distanceFromRoadCenter = abs(x - ROAD_CENTER_X);
    float halfRoadWidth = ROAD_HALF_WIDTH;
    float totalWidth = halfRoadWidth + ROAD_SMOOTH_WIDTH;
    
    if (distanceFromRoadCenter < halfRoadWidth) {
        return 1.0;
    } else if (distanceFromRoadCenter < totalWidth) {
        float blendDistance = distanceFromRoadCenter - halfRoadWidth;
        float blendFactor = 1.0 - (blendDistance / ROAD_SMOOTH_WIDTH);
        return smoothStep(0.0, 1.0, blendFactor);
    }
    
    return 0.0;
}

float getRoadLaneMarking(vec3 worldPos) {
    float x = worldPos.x;
    float z = worldPos.z;
    
    float marking = 0.0;
    
    // Center dashed line (at x=0) - using step for sharp edges
    float distFromCenter = abs(x);
    float centerLineCheck = step(distFromCenter, CENTER_LINE_WIDTH * 0.5);
    
    // Dash pattern
    float dashCycle = DASH_LENGTH + DASH_GAP;
    float zMod = mod(z, dashCycle);
    float dashCheck = step(zMod, DASH_LENGTH);
    
    marking = max(marking, centerLineCheck * dashCheck);
    
    // Left edge line (at x=-3.8) - sharp edges
    float distFromLeftEdge = abs(x + EDGE_LINE_POSITION);
    marking = max(marking, step(distFromLeftEdge, EDGE_LINE_WIDTH * 0.5));
    
    // Right edge line (at x=+3.8) - sharp edges
    float distFromRightEdge = abs(x - EDGE_LINE_POSITION);
    marking = max(marking, step(distFromRightEdge, EDGE_LINE_WIDTH * 0.5));
    
    return marking;
}

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    float depth = - viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;

    // Terrain data
    vec4 terrainData = texture2D(uTexture, uv);
    vec3 normal = terrainData.rgb;  // Normal stored in RGB channels

    // Slope
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

    vec3 viewDirection = normalize(modelPosition.xyz - cameraPosition);
    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vec3 viewNormal = normalize(normalMatrix * normal);

    // Color - Sample gradient based on elevation
    float elevationNormalized = clamp((terrainData.a + 10.0) / 20.0, 0.0, 1.0);
    vec3 gradientColor = texture2D(uGradientTexture, vec2(0.5, elevationNormalized)).rgb;
    
    // Rock color for steep slopes
    vec3 rockColor = vec3(0.55, 0.55, 0.55);
    float rockBlend = smoothstep(0.35, 0.55, slope);
    vec3 terrainColor = mix(gradientColor, rockColor, rockBlend);
    
    // Grass distance attenuation
    float grassDistanceAttenuation = getGrassAttenuation(modelPosition.xz);
    float grassSlopeAttenuation = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
    float grassAttenuation = grassDistanceAttenuation * grassSlopeAttenuation;
    
    // Darken distant terrain (reduced from 0.77 to 0.92 for brightness)
    vec3 grassColor = mix(terrainColor * 0.92, terrainColor, 1.0 - grassAttenuation);

    // Calculate road influence from world position
    float roadInfluence = getRoadInfluence(modelPosition.x);
    
    // Start with base road/grass color blend
    vec3 color = mix(grassColor, ROAD_COLOR, roadInfluence);
    
    // Add lane markings only on road surface
    float laneMarking = getRoadLaneMarking(modelPosition.xyz);
    color = mix(color, LINE_COLOR, laneMarking * roadInfluence);

    // Sun shade
    float sunShade = getSunShade(normal);
    color = getSunShadeColor(color, sunShade);

    // Ambient occlusion - DISABLED - was causing too much darkness
    // float ao = getAmbientOcclusion(normal);
    // color *= ao;
    
    // Add strong ambient light to brighten the scene
    color = color * 1.3;

    // Sun reflection (reduce intensity on steep slopes to prevent artifacts)
    float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
    sunReflection *= (1.0 - slope);  // Reduce on steep slopes
    color = getSunReflectionColor(color, sunReflection);

    // Fog
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);
    
    // Boost color saturation for vibrancy (reduced from 1.25 to 1.15)
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = luminance + (color - luminance) * 1.15;
    
    // Clamp to prevent neon artifacts
    color = clamp(color, vec3(0.0), vec3(1.0));

    // vec3 dirtColor = vec3(0.3, 0.2, 0.1);
    // vec3 color = mix(dirtColor, grassColor, terrainData.g);

    // Varyings
    vColor = color;
}