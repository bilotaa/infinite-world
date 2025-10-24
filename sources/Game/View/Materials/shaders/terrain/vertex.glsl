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
uniform sampler2D uNoiseTexture;

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
const vec3 ROAD_COLOR = vec3(0.6, 0.6, 0.6);
const vec3 LINE_COLOR = vec3(1.0, 1.0, 1.0);
const float ROAD_HALF_WIDTH = 8.0;
const float CENTER_LINE_WIDTH = 1.0;
const float EDGE_LINE_WIDTH = 0.8;
const float DASH_LENGTH = 5.0;
const float DASH_GAP = 2.0;
const float EDGE_LINE_POSITION = 7.0;
const float ROAD_CENTER_X = 0.0;
const float ROAD_SMOOTH_WIDTH = 0.5;

// NATURAL TERRAIN COLORS (realistic, toned down)
const vec3 GRASS_BASE = vec3(0.32, 0.48, 0.22);
const vec3 GRASS_LIGHT = vec3(0.40, 0.56, 0.26);
const vec3 DIRT_BASE = vec3(0.38, 0.30, 0.22);
const vec3 ROCK_DARK = vec3(0.40, 0.40, 0.42);
const vec3 ROCK_LIGHT = vec3(0.55, 0.53, 0.50);
const vec3 SNOW_COLOR = vec3(0.88, 0.90, 0.92);
const vec3 SNOW_SHADOW = vec3(0.72, 0.76, 0.82);

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

    float distFromCenter = abs(x);
    float centerLineCheck = step(distFromCenter, CENTER_LINE_WIDTH * 0.5);

    float dashCycle = DASH_LENGTH + DASH_GAP;
    float zMod = mod(z, dashCycle);
    float dashCheck = step(zMod, DASH_LENGTH);

    marking = max(marking, centerLineCheck * dashCheck);

    float distFromLeftEdge = abs(x + EDGE_LINE_POSITION);
    marking = max(marking, step(distFromLeftEdge, EDGE_LINE_WIDTH * 0.5));

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
    vec3 normal = terrainData.rgb;
    float elevation = terrainData.a;

    // Slope calculation
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

    vec3 viewDirection = normalize(modelPosition.xyz - cameraPosition);
    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vec3 viewNormal = normalize(normalMatrix * normal);

    // ============= NATURAL TERRAIN COLORS =============

    // Subtle multi-scale noise
    vec2 noiseUV1 = modelPosition.xz * 0.04;
    vec2 noiseUV2 = modelPosition.xz * 0.12;

    float noise1 = texture2D(uNoiseTexture, noiseUV1).r;
    float noise2 = texture2D(uNoiseTexture, noiseUV2).g;

    // Moisture for grass variation
    float moisture = noise1 * 0.7 + noise2 * 0.3;

    // GRASS LAYER (base terrain)
    vec3 grassColor = mix(GRASS_BASE, GRASS_LIGHT, moisture);
    grassColor = mix(grassColor, grassColor * 0.92, noise2 * 0.12);

    // DIRT patches (subtle, not too many)
    vec3 dirtColor = DIRT_BASE * (0.95 + noise2 * 0.1);
    float dirtAmount = smoothstep(0.55, 0.65, noise1) * (1.0 - slope * 2.0);
    vec3 terrainColor = mix(grassColor, dirtColor, dirtAmount * 0.2);

    // ROCK on slopes
    vec3 rockColor = mix(ROCK_DARK, ROCK_LIGHT, noise2 * 0.6 + 0.2);
    rockColor = mix(rockColor, rockColor * 0.90, noise1 * 0.15);

    float rockBlend = smoothstep(0.3, 0.55, slope);
    terrainColor = mix(terrainColor, rockColor, rockBlend);

    // SNOW on high mountains
    vec3 snowColor = mix(SNOW_SHADOW, SNOW_COLOR, 0.6 + noise1 * 0.4);
    float snowLine = 7.0;
    float snowBlend = smoothstep(snowLine, snowLine + 2.5, elevation);
    snowBlend *= (1.0 - slope * 0.4);
    terrainColor = mix(terrainColor, snowColor, snowBlend);

    // Distance attenuation
    float grassDistanceAttenuation = getGrassAttenuation(modelPosition.xz);
    float grassSlopeAttenuation = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
    float grassAttenuation = grassDistanceAttenuation * grassSlopeAttenuation;

    vec3 baseColor = mix(terrainColor * 0.92, terrainColor, 1.0 - grassAttenuation);

    // ============= ROAD SYSTEM =============
    float roadInfluence = getRoadInfluence(modelPosition.x);
    vec3 color = mix(baseColor, ROAD_COLOR, roadInfluence);

    float laneMarking = getRoadLaneMarking(modelPosition.xyz);
    color = mix(color, LINE_COLOR, laneMarking * roadInfluence);

    // ============= NATURAL LIGHTING =============

    // Diffuse sun lighting
    float sunShade = getSunShade(normal);
    sunShade = sunShade * 0.65 + 0.35;
    color = getSunShadeColor(color, sunShade);

    // Subtle sky ambient
    float skyLight = (normal.y * 0.5 + 0.5);
    vec3 skyColor = vec3(0.42, 0.48, 0.60);
    color += skyColor * skyLight * 0.12;

    // Moderate ambient boost
    color = color * 1.2;

    // Subtle rim lighting
    float rimLight = pow(1.0 - abs(dot(viewDirection, worldNormal)), 3.5);
    color += vec3(0.72, 0.78, 0.88) * rimLight * 0.08;

    // Rock specular (subtle)
    float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
    sunReflection *= rockBlend * 0.3;
    color = getSunReflectionColor(color, sunReflection);

    // Grass subsurface (subtle)
    float backlight = max(0.0, dot(normal, -uSunPosition));
    if (backlight > 0.0 && rockBlend < 0.4 && snowBlend < 0.3) {
        color += vec3(0.82, 0.88, 0.62) * backlight * 0.1 * (1.0 - rockBlend);
    }

    // ============= ATMOSPHERIC EFFECTS =============

    // Height-based atmosphere (subtle)
    float atmosphericTint = clamp(elevation / 18.0, 0.0, 0.2);
    color = mix(color, color * vec3(0.88, 0.92, 1.05), atmosphericTint);

    // Distance fog
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);

    // Subtle saturation boost
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = luminance + (color - luminance) * 1.08;

    // Final clamp
    color = clamp(color, vec3(0.0), vec3(1.0));

    vColor = color;
}
