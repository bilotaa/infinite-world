uniform vec3 uPlayerPosition;
uniform float uLightnessSmoothness;
uniform float uFresnelOffset;
uniform float uFresnelScale;
uniform float uFresnelPower;
uniform vec3 uSunPosition;
uniform float uGrassDistance;
uniform sampler2D uTexture;
uniform sampler2D uFogTexture;

varying vec3 vColor;

#include ../partials/inverseLerp.glsl
#include ../partials/remap.glsl
#include ../partials/getSunShade.glsl;
#include ../partials/getSunShadeColor.glsl;
#include ../partials/getSunReflection.glsl;
#include ../partials/getSunReflectionColor.glsl;
#include ../partials/getFogColor.glsl;
#include ../partials/getGrassAttenuation.glsl;

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

    // Color
    vec3 uGrassDefaultColor = vec3(0.52, 0.65, 0.26);
    vec3 uGrassShadedColor = vec3(0.52 / 1.3, 0.65 / 1.3, 0.26 / 1.3);
    
    // Grass distance attenuation
    // Terrain must match the bottom of the grass which is darker
    float grassDistanceAttenuation = getGrassAttenuation(modelPosition.xz);
    float grassSlopeAttenuation = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
    float grassAttenuation = grassDistanceAttenuation * grassSlopeAttenuation;
    vec3 grassColor = mix(uGrassShadedColor, uGrassDefaultColor, 1.0 - grassAttenuation);

    // Start with base road/grass color blend
    vec3 color = mix(grassColor, ROAD_COLOR, 1.0);
    
    // Add lane markings only on road surface
    float laneMarking = getRoadLaneMarking(modelPosition.xyz);
    color = mix(color, LINE_COLOR, laneMarking);

    // Sun shade
    float sunShade = getSunShade(normal);
    color = getSunShadeColor(color, sunShade);

    // Sun reflection
    float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
    color = getSunReflectionColor(color, sunReflection);

    // Fog
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);

    // vec3 dirtColor = vec3(0.3, 0.2, 0.1);
    // vec3 color = mix(dirtColor, grassColor, terrainData.g);

    // Varyings
    vColor = color;
}