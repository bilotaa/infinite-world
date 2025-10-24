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

// REALISTIC WILDFLOWER COLORS (toned down)
const vec3 FLOWER_YELLOW = vec3(0.85, 0.75, 0.20);
const vec3 FLOWER_WHITE = vec3(0.88, 0.86, 0.82);
const vec3 FLOWER_PURPLE = vec3(0.55, 0.30, 0.60);
const vec3 FLOWER_PINK = vec3(0.80, 0.50, 0.60);

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

    // Natural wind system
    vec2 windUV1 = modelPosition.xz * 0.02 + uTime * 0.05;
    vec2 windUV2 = modelPosition.xz * 0.08 + uTime * 0.03;
    vec4 windNoise1 = texture2D(uNoiseTexture, windUV1);
    vec4 windNoise2 = texture2D(uNoiseTexture, windUV2);

    float windStrength = 0.4;
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

    // ============= NATURAL GRASS COLORS =============

    vec2 bladeID = modelCenter.xz * 0.1;
    vec4 bladeNoise = texture2D(uNoiseTexture, bladeID);

    // Wildflowers - only 5% of blades
    bool isFlower = bladeNoise.r > 0.95;

    // REALISTIC GRASS COLORS (toned down for natural look)
    vec3 grassBright = vec3(0.38, 0.55, 0.22);
    vec3 grassMedium = vec3(0.32, 0.48, 0.20);
    vec3 grassDark = vec3(0.25, 0.40, 0.18);
    vec3 grassYellow = vec3(0.42, 0.52, 0.24);
    vec3 grassBlue = vec3(0.30, 0.46, 0.26);

    // Select grass color
    vec3 baseGrassColor;
    float colorSelector = bladeNoise.g * 5.0;

    if (colorSelector < 1.0) {
        baseGrassColor = mix(grassMedium, grassBright, fract(colorSelector));
    } else if (colorSelector < 2.0) {
        baseGrassColor = mix(grassBright, grassYellow, fract(colorSelector));
    } else if (colorSelector < 3.0) {
        baseGrassColor = mix(grassYellow, grassDark, fract(colorSelector));
    } else if (colorSelector < 4.0) {
        baseGrassColor = mix(grassDark, grassBlue, fract(colorSelector));
    } else {
        baseGrassColor = mix(grassBlue, grassMedium, fract(colorSelector));
    }

    // Subtle variation
    baseGrassColor += (bladeNoise.b - 0.5) * 0.05;

    // WILDFLOWERS
    vec3 flowerColor = FLOWER_YELLOW;
    if (bladeNoise.b < 0.25) {
        flowerColor = FLOWER_WHITE;
    } else if (bladeNoise.b < 0.5) {
        flowerColor = FLOWER_PURPLE;
    } else if (bladeNoise.b < 0.75) {
        flowerColor = FLOWER_PINK;
    }

    // Base color
    vec3 baseColor;
    if (isFlower && tipness > 0.5) {
        baseColor = flowerColor;
    } else if (isFlower) {
        baseColor = grassMedium * 0.85;
    } else {
        vec3 baseShade = baseGrassColor * 0.75;
        vec3 tipShade = baseGrassColor * 1.15;

        if (bladeNoise.g > 0.8) {
            tipShade += vec3(0.08, 0.06, -0.03);
        }

        baseColor = mix(baseShade, tipShade, tipness);
    }

    // Distance fade
    vec3 shadedColor = baseColor * 0.75;
    vec3 color = mix(shadedColor, baseColor, 1.0 - scale * 0.4);

    // ============= NATURAL LIGHTING =============

    // Sun lighting
    float sunShade = getSunShade(normal);
    sunShade = sunShade * 0.65 + 0.35;
    color = getSunShadeColor(color, sunShade);

    // Subtle sky light
    float skyLight = (normal.y * 0.5 + 0.5) * 0.2;
    color += vec3(0.45, 0.52, 0.65) * skyLight;

    // Moderate ambient boost (not too bright)
    color = color * 1.15;

    // Subtle subsurface scattering
    float backlight = dot(normal, -uSunPosition);
    if (backlight < 0.0 && !isFlower) {
        float subsurface = -backlight * 0.3 * tipness;
        color += vec3(0.85, 0.88, 0.55) * subsurface;
    }

    // Flower glow (subtle)
    if (isFlower && tipness > 0.5) {
        float flowerGlow = max(0.0, dot(normal, -uSunPosition)) * 0.2;
        color += flowerColor * flowerGlow * 0.3;
    }

    // Subtle rim light
    float rimLight = pow(1.0 - abs(dot(viewDirection, worldNormal)), 4.0);
    color += vec3(0.75, 0.80, 0.90) * rimLight * 0.08 * tipness;

    // Very subtle specular
    float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
    sunReflection *= tipness * 0.1;
    color = getSunReflectionColor(color, sunReflection);

    // Fog
    float depth = -viewPosition.z;
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);

    // Subtle color boost (not too much)
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = luminance + (color - luminance) * 1.1;

    // Clamp
    color = clamp(color, vec3(0.0), vec3(1.0));

    vColor = color;
}
