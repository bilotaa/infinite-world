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

// BRIGHT GAME-STYLE GRASS COLORS (like the screenshot)
const vec3 GRASS_BRIGHT_GREEN = vec3(0.55, 0.75, 0.35);    // Bright lime green
const vec3 GRASS_VIBRANT = vec3(0.60, 0.80, 0.40);         // Even brighter
const vec3 GRASS_LIME = vec3(0.58, 0.78, 0.38);            // Lime tint

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

    // Natural wind
    vec2 windUV1 = modelPosition.xz * 0.02 + uTime * 0.05;
    vec4 windNoise1 = texture2D(uNoiseTexture, windUV1);

    float windStrength = 0.4;
    modelPosition.x += (windNoise1.x - 0.5) * tipness * windStrength;
    modelPosition.z += (windNoise1.y - 0.5) * tipness * windStrength;

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    vec3 viewDirection = normalize(modelPosition.xyz - cameraPosition);
    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vec3 viewNormal = normalize(normalMatrix * normal);

    // ============= BRIGHT GAME-STYLE GRASS =============

    vec2 bladeID = modelCenter.xz * 0.1;
    vec4 bladeNoise = texture2D(uNoiseTexture, bladeID);

    // Bright lime green grass color
    vec3 baseGrassColor = mix(GRASS_BRIGHT_GREEN, GRASS_VIBRANT, bladeNoise.r);
    baseGrassColor = mix(baseGrassColor, GRASS_LIME, bladeNoise.g * 0.5);

    // Slight variation
    baseGrassColor += (bladeNoise.b - 0.5) * 0.03;

    // Base to tip gradient (keep it bright)
    vec3 baseShade = baseGrassColor * 0.85;
    vec3 tipShade = baseGrassColor * 1.1;

    vec3 baseColor = mix(baseShade, tipShade, tipness);

    // Very minimal distance fade (keep brightness)
    vec3 color = mix(baseColor * 0.95, baseColor, 1.0 - scale * 0.3);

    // ============= BRIGHT GAME LIGHTING =============

    // Soft sun lighting
    float sunShade = getSunShade(normal);
    sunShade = sunShade * 0.5 + 0.5;  // Very soft shadows
    color = getSunShadeColor(color, sunShade);

    // High ambient light (game-style bright)
    color = color * 1.8;

    // No fog for crystal clear view
    // (removed fog application)

    // Boost saturation for vibrant game look
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = luminance + (color - luminance) * 1.3;

    // Clamp
    color = clamp(color, vec3(0.0), vec3(1.0));

    vColor = color;
}
