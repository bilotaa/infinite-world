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
// attribute float tipness;

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
#include ../partials/getAmbientOcclusion.glsl;

// Road configuration - matches terrain shader
const float ROAD_CENTER_X = 0.0;
const float ROAD_HALF_WIDTH = 8.0;                      // Half width of road (doubled)
const float ROAD_SMOOTH_WIDTH = 0.5;                    // Sharp edges to match worker

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
    newCenter.y = mod(newCenter.y + halfSize, uGrassDistance) - halfSize; // Y considered as Z
    vec4 modelCenter = modelMatrix * vec4(newCenter.x, 0.0, newCenter.y, 1.0);

    // Move grass to center
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.xz += newCenter; // Y considered as Z

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

    vec3 normal = terrainData.rgb;  // Normal stored in RGB channels

    modelPosition.y += terrainData.a;
    modelCenter.y += terrainData.a;

    // Slope
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

    // Attenuation
    float distanceScale = getGrassAttenuation(modelCenter.xz);
    float slopeScale = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
    
    // Road attenuation - hide grass on road (calculate from position)
    float roadInfluence = getRoadInfluence(modelCenter.x);
    float roadScale = 1.0 - roadInfluence;
    
    float scale = distanceScale * slopeScale * roadScale;
    modelPosition.xyz = mix(modelCenter.xyz, modelPosition.xyz, scale);

    // Tipness
    float tipness = step(2.0, mod(float(gl_VertexID) + 1.0, 3.0));

    // Wind - NOW WORKS AT ALL DISTANCES (removed scale multiplier)
    vec2 noiseUv = modelPosition.xz * 0.02 + uTime * 0.05;
    vec4 noiseColor = texture2D(uNoiseTexture, noiseUv);
    
    // Wind strength independent of distance - grass always moves beautifully
    float windStrength = 0.4;
    modelPosition.x += (noiseColor.x - 0.5) * tipness * windStrength;
    modelPosition.z += (noiseColor.y - 0.5) * tipness * windStrength;

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    vec3 viewDirection = normalize(modelPosition.xyz - cameraPosition);
    // vec3 normal = vec3(0.0, 1.0, 0.0);
    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vec3 viewNormal = normalize(normalMatrix * normal);

    // ============= REALISTIC GRASS COLORS (7 variations) =============
    // Base grass color palette (realistic natural grass hues)
    vec3 grassBrightGreen = vec3(0.45, 0.68, 0.22);      // Bright spring green
    vec3 grassMediumGreen = vec3(0.38, 0.62, 0.20);      // Medium healthy green
    vec3 grassDarkGreen = vec3(0.28, 0.52, 0.16);        // Deep forest green
    vec3 grassOliveGreen = vec3(0.42, 0.58, 0.25);       // Olive tint
    vec3 grassYellowGreen = vec3(0.52, 0.65, 0.28);      // Yellow-green mix
    vec3 grassLimeGreen = vec3(0.48, 0.70, 0.24);        // Lime accent
    vec3 grassSageGreen = vec3(0.40, 0.56, 0.30);        // Sage/grey green
    
    // Per-blade color variation using noise texture
    vec2 colorNoiseUv = modelCenter.xz * 0.1;
    vec4 colorNoise = texture2D(uNoiseTexture, colorNoiseUv);
    
    // Select base color based on noise value (7 variations)
    vec3 baseGrassColor;
    float colorSelector = colorNoise.r * 7.0;
    
    if (colorSelector < 1.0) {
        baseGrassColor = mix(grassMediumGreen, grassBrightGreen, fract(colorSelector));
    } else if (colorSelector < 2.0) {
        baseGrassColor = mix(grassBrightGreen, grassYellowGreen, fract(colorSelector));
    } else if (colorSelector < 3.0) {
        baseGrassColor = mix(grassYellowGreen, grassLimeGreen, fract(colorSelector));
    } else if (colorSelector < 4.0) {
        baseGrassColor = mix(grassLimeGreen, grassOliveGreen, fract(colorSelector));
    } else if (colorSelector < 5.0) {
        baseGrassColor = mix(grassOliveGreen, grassDarkGreen, fract(colorSelector));
    } else if (colorSelector < 6.0) {
        baseGrassColor = mix(grassDarkGreen, grassSageGreen, fract(colorSelector));
    } else {
        baseGrassColor = mix(grassSageGreen, grassMediumGreen, fract(colorSelector));
    }
    
    // Add subtle per-blade random tint variation
    vec3 colorVariation = vec3(
        colorNoise.g * 0.08 - 0.04,  // Red variation
        colorNoise.b * 0.06 - 0.03,  // Green variation  
        colorNoise.a * 0.05 - 0.025  // Blue variation
    );
    baseGrassColor += colorVariation;
    
    // Darker base, lighter tips (natural grass gradient)
    vec3 baseColor = baseGrassColor * 0.75;  // Darker at base
    vec3 tipColor = baseGrassColor * 1.15;   // Lighter at tip
    
    // Add slight yellowing to some tips (natural look)
    if (colorNoise.r > 0.7) {
        tipColor += vec3(0.12, 0.10, -0.05);  // Yellow tint on some tips
    }
    
    // Shaded version for distance fade
    vec3 grassShadedColor = baseGrassColor * 0.65;
    vec3 lowColor = mix(grassShadedColor, baseGrassColor, 1.0 - scale);
    
    // Blend from base to tip based on height
    vec3 color = mix(lowColor, tipColor, tipness);

    // Sun shade
    float sunShade = getSunShade(normal);
    color = getSunShadeColor(color, sunShade);

    // Ambient occlusion
    float ao = getAmbientOcclusion(normal);
    color *= ao;

    // Sun reflection (reduce on steep slopes to prevent neon artifacts)
    float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
    sunReflection *= (1.0 - slope);  // Reduce on steep slopes
    color = getSunReflectionColor(color, sunReflection);
    
    // Subsurface scattering - grass glows when backlit
    float backlight = dot(normal, -uSunPosition);
    if (backlight < 0.0) {
        float subsurfaceStrength = -backlight * 0.4 * tipness;
        vec3 subsurfaceColor = vec3(1.0, 0.95, 0.6);
        color += subsurfaceColor * subsurfaceStrength;
    }
    
    // Fog
    float depth = -viewPosition.z;
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);
    
    // Boost color saturation for vibrancy
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = luminance + (color - luminance) * 1.25;
    
    // Clamp to prevent neon artifacts
    color = clamp(color, vec3(0.0), vec3(1.0));

    vColor = color;
    // vColor = vec3(slope);
}