#define M_PI 3.1415926535897932384626433832795

uniform float uTime;
uniform float uGrassDistance;
uniform vec3 uPlayerPosition;
uniform float uTerrainSize;
uniform float uTerrainTextureSize;
uniform sampler2D uTerrainATexture;
uniform vec2 uTerrainAOffset;
uniform sampler2D uTerrainBTexture;
uniform vec2 uTerrainBOffset;
uniform sampler2D uTerrainCTexture;
uniform vec2 uTerrainCOffset;
uniform sampler2D uTerrainDTexture;
uniform vec2 uTerrainDOffset;
uniform sampler2D uNoiseTexture;
uniform float uFresnelOffset;
uniform float uFresnelScale;
uniform float uFresnelPower;
uniform vec3 uSunPosition;

attribute vec2 center;

varying vec3 vColor;

#include ../partials/inverseLerp.glsl
#include ../partials/remap.glsl
#include ../partials/getSunShade.glsl;
#include ../partials/getSunShadeColor.glsl;
#include ../partials/getSunReflection.glsl;
#include ../partials/getSunReflectionColor.glsl;
#include ../partials/getGrassAttenuation.glsl;
#include ../partials/getRotatePivot2d.glsl;
#include ../partials/getFogColor.glsl;

// Road configuration
const float ROAD_CENTER_X = 0.0;
const float ROAD_HALF_WIDTH = 8.0;
const float ROAD_SMOOTH_WIDTH = 0.5;

// WILDFLOWER COLORS
const vec3 FLOWER_YELLOW = vec3(0.95, 0.85, 0.25);
const vec3 FLOWER_WHITE = vec3(0.98, 0.96, 0.92);
const vec3 FLOWER_PURPLE = vec3(0.65, 0.35, 0.75);
const vec3 FLOWER_PINK = vec3(0.95, 0.55, 0.75);

float smoothStepCustom(float edge0, float edge1, float x) {
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
        return smoothStepCustom(0.0, 1.0, blendFactor);
    }

    return 0.0;
}

void main()
{
    // Recalculate center and keep around player
    vec2 newCenter = center;
    newCenter -= uPlayerPosition.xz;
    float halfSize = uGrassDistance * 0.5;
    newCenter.x = mod(newCenter.x + halfSize, uGrassDistance) - halfSize;
    newCenter.y = mod(newCenter.y + halfSize, uGrassDistance) - halfSize;
    vec4 modelCenter = modelMatrix * vec4(newCenter.x, 0.0, newCenter.y, 1.0);

    // Move grass to center
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.xz += newCenter;

    // Rotate blade to face camera
    float angleToCamera = atan(modelCenter.x - cameraPosition.x, modelCenter.z - cameraPosition.z);
    modelPosition.xz = getRotatePivot2d(modelPosition.xz, angleToCamera, modelCenter.xz);

    // Terrains data
    vec2 terrainAUv = (modelPosition.xz - uTerrainAOffset.xy) / uTerrainSize;
    vec2 terrainBUv = (modelPosition.xz - uTerrainBOffset.xy) / uTerrainSize;
    vec2 terrainCUv = (modelPosition.xz - uTerrainCOffset.xy) / uTerrainSize;
    vec2 terrainDUv = (modelPosition.xz - uTerrainDOffset.xy) / uTerrainSize;

    float fragmentSize = 1.0 / uTerrainTextureSize;
    vec4 terrainAColor = texture2D(uTerrainATexture, terrainAUv * (1.0 - fragmentSize) + fragmentSize * 0.5);
    vec4 terrainBColor = texture2D(uTerrainBTexture, terrainBUv * (1.0 - fragmentSize) + fragmentSize * 0.5);
    vec4 terrainCColor = texture2D(uTerrainCTexture, terrainCUv * (1.0 - fragmentSize) + fragmentSize * 0.5);
    vec4 terrainDColor = texture2D(uTerrainDTexture, terrainDUv * (1.0 - fragmentSize) + fragmentSize * 0.5);

    vec4 terrainData = vec4(0);
    terrainData += step(0.0, terrainAUv.x) * step(terrainAUv.x, 1.0) * step(0.0, terrainAUv.y) * step(terrainAUv.y, 1.0) * terrainAColor;
    terrainData += step(0.0, terrainBUv.x) * step(terrainBUv.x, 1.0) * step(0.0, terrainBUv.y) * step(terrainBUv.y, 1.0) * terrainBColor;
    terrainData += step(0.0, terrainCUv.x) * step(terrainCUv.x, 1.0) * step(0.0, terrainCUv.y) * step(terrainCUv.y, 1.0) * terrainCColor;
    terrainData += step(0.0, terrainDUv.x) * step(terrainDUv.x, 1.0) * step(0.0, terrainDUv.y) * step(terrainDUv.y, 1.0) * terrainDColor;

    vec3 normal = terrainData.rgb;

    modelPosition.y += terrainData.a;
    modelCenter.y += terrainData.a;

    // Slope
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

    // Attenuation
    float distanceScale = getGrassAttenuation(modelCenter.xz);
    float slopeScale = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);

    // Road attenuation
    float roadInfluence = getRoadInfluence(modelCenter.x);
    float roadScale = 1.0 - roadInfluence;

    float scale = distanceScale * slopeScale * roadScale;
    modelPosition.xyz = mix(modelCenter.xyz, modelPosition.xyz, scale);

    // Tipness
    float tipness = step(2.0, mod(float(gl_VertexID) + 1.0, 3.0));

    // Enhanced wind with multiple layers
    vec2 windUV1 = modelPosition.xz * 0.02 + uTime * 0.05;
    vec2 windUV2 = modelPosition.xz * 0.08 + uTime * 0.03;
    vec4 windNoise1 = texture2D(uNoiseTexture, windUV1);
    vec4 windNoise2 = texture2D(uNoiseTexture, windUV2);

    // Layered wind for realism
    float windStrength = 0.5;
    float windX = (windNoise1.x - 0.5) * 0.7 + (windNoise2.x - 0.5) * 0.3;
    float windZ = (windNoise1.y - 0.5) * 0.7 + (windNoise2.y - 0.5) * 0.3;

    modelPosition.x += windX * tipness * windStrength;
    modelPosition.z += windZ * tipness * windStrength;

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    vec3 viewDirection = normalize(modelPosition.xyz - cameraPosition);
    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vec3 viewNormal = normalize(normalMatrix * normal);

    // ============= ENHANCED GRASS + WILDFLOWERS SYSTEM =============

    // Per-blade identification
    vec2 bladeID = modelCenter.xz * 0.1;
    vec4 bladeNoise = texture2D(uNoiseTexture, bladeID);

    // Decide if this is a flower (10% of blades)
    bool isFlower = bladeNoise.r > 0.9;

    // GRASS COLORS (More variety)
    vec3 grassBrightGreen = vec3(0.48, 0.72, 0.28);
    vec3 grassMediumGreen = vec3(0.38, 0.62, 0.24);
    vec3 grassDarkGreen = vec3(0.28, 0.50, 0.20);
    vec3 grassYellowGreen = vec3(0.55, 0.68, 0.32);
    vec3 grassBlueGreen = vec3(0.35, 0.58, 0.35);

    // Select grass color based on noise
    vec3 baseGrassColor;
    float colorSelector = bladeNoise.g * 5.0;

    if (colorSelector < 1.0) {
        baseGrassColor = mix(grassMediumGreen, grassBrightGreen, fract(colorSelector));
    } else if (colorSelector < 2.0) {
        baseGrassColor = mix(grassBrightGreen, grassYellowGreen, fract(colorSelector));
    } else if (colorSelector < 3.0) {
        baseGrassColor = mix(grassYellowGreen, grassDarkGreen, fract(colorSelector));
    } else if (colorSelector < 4.0) {
        baseGrassColor = mix(grassDarkGreen, grassBlueGreen, fract(colorSelector));
    } else {
        baseGrassColor = mix(grassBlueGreen, grassMediumGreen, fract(colorSelector));
    }

    // Add micro variation
    vec3 microVariation = vec3(
        bladeNoise.b * 0.1 - 0.05,
        bladeNoise.a * 0.08 - 0.04,
        bladeNoise.r * 0.06 - 0.03
    );
    baseGrassColor += microVariation;

    // WILDFLOWERS
    vec3 flowerColor = FLOWER_YELLOW;
    if (bladeNoise.b < 0.3) {
        flowerColor = FLOWER_WHITE;
    } else if (bladeNoise.b < 0.5) {
        flowerColor = FLOWER_PURPLE;
    } else if (bladeNoise.b < 0.7) {
        flowerColor = FLOWER_PINK;
    }

    // Base color selection
    vec3 baseColor;
    if (isFlower && tipness > 0.5) {
        // Flower head at tip
        baseColor = flowerColor * (0.9 + bladeNoise.a * 0.2);
    } else if (isFlower) {
        // Flower stem
        baseColor = grassMediumGreen * 0.8;
    } else {
        // Regular grass - darker at base, lighter at tip
        vec3 baseShade = baseGrassColor * 0.70;
        vec3 tipShade = baseGrassColor * 1.25;

        // Natural yellowing on some tips
        if (bladeNoise.g > 0.75) {
            tipShade += vec3(0.15, 0.12, -0.08);
        }

        baseColor = mix(baseShade, tipShade, tipness);
    }

    // Distance fade
    vec3 shadedColor = baseColor * 0.7;
    vec3 color = mix(shadedColor, baseColor, 1.0 - scale * 0.5);

    // ============= ADVANCED LIGHTING =============

    // Sun shade (diffuse)
    float sunShade = getSunShade(normal);
    sunShade = sunShade * 0.75 + 0.25; // Softer shadows
    color = getSunShadeColor(color, sunShade);

    // Sky lighting (ambient from above)
    float skyLight = (normal.y * 0.5 + 0.5) * 0.25;
    color += vec3(0.5, 0.6, 0.8) * skyLight;

    // Strong ambient boost
    color = color * 1.5;

    // Subsurface scattering (grass glows when backlit)
    float backlight = dot(normal, -uSunPosition);
    if (backlight < 0.0 && !isFlower) {
        float subsurface = -backlight * 0.6 * tipness;
        color += vec3(1.0, 0.98, 0.65) * subsurface;
    }

    // Flowers glow in sunlight
    if (isFlower && tipness > 0.5) {
        float flowerGlow = max(0.0, dot(normal, -uSunPosition)) * 0.3;
        color += flowerColor * flowerGlow;
    }

    // Rim lighting
    float rimLight = pow(1.0 - abs(dot(viewDirection, worldNormal)), 4.0);
    color += vec3(0.9, 0.95, 1.0) * rimLight * 0.15 * tipness;

    // Specular on grass tips (subtle wetness)
    float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
    sunReflection *= tipness * 0.2;
    color = getSunReflectionColor(color, sunReflection);

    // ============= ATMOSPHERIC EFFECTS =============

    // Fog
    float depth = -viewPosition.z;
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);

    // Vibrant color grading
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = luminance + (color - luminance) * 1.25;

    // Final clamp
    color = clamp(color, vec3(0.0), vec3(1.0));

    vColor = color;
}
