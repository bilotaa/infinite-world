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

// NATURAL REALISTIC GRASS COLORS (original style)
const vec3 GRASS_DARK = vec3(0.22, 0.35, 0.18);      // Dark natural grass
const vec3 GRASS_MID = vec3(0.28, 0.42, 0.22);       // Mid-tone grass
const vec3 GRASS_LIGHT = vec3(0.32, 0.48, 0.24);     // Lighter grass tips

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

    // Combined scale (road removed)
    float scale = distanceScale * slopeScale;
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

    // ============= NATURAL REALISTIC GRASS =============

    vec2 bladeID = modelCenter.xz * 0.1;
    vec4 bladeNoise = texture2D(uNoiseTexture, bladeID);

    // Natural dark green grass color
    vec3 baseGrassColor = mix(GRASS_DARK, GRASS_MID, bladeNoise.r);
    baseGrassColor = mix(baseGrassColor, GRASS_LIGHT, bladeNoise.g * 0.3);

    // Slight variation
    baseGrassColor += (bladeNoise.b - 0.5) * 0.03;

    // Base to tip gradient (natural look)
    vec3 baseShade = baseGrassColor * 0.75;
    vec3 tipShade = baseGrassColor * 1.15;

    vec3 baseColor = mix(baseShade, tipShade, tipness);

    // Natural distance fade
    vec3 color = mix(baseColor * 0.85, baseColor, 1.0 - scale * 0.5);

    // ============= NATURAL LIGHTING =============

    // Natural sun lighting
    float sunShade = getSunShade(normal);
    sunShade = sunShade * 0.65 + 0.35;
    color = getSunShadeColor(color, sunShade);

    // Natural ambient light
    color = color * 1.3;

    // Atmospheric fog (restored)
    float depth = - viewPosition.z;
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);

    // Subtle saturation (original)
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = luminance + (color - luminance) * 1.1;

    // Clamp
    color = clamp(color, vec3(0.0), vec3(1.0));

    vColor = color;
}
