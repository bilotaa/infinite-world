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

// ALL GRASS TERRAIN COLORS
const vec3 GRASS_RICH = vec3(0.28, 0.42, 0.20);        // Rich dark grass
const vec3 GRASS_MEADOW = vec3(0.35, 0.50, 0.24);      // Meadow grass
const vec3 GRASS_DRY = vec3(0.40, 0.48, 0.22);         // Dry grass
const vec3 DIRT_RICH = vec3(0.35, 0.28, 0.20);         // Dark rich soil
const vec3 DIRT_DRY = vec3(0.45, 0.38, 0.28);          // Dry dirt

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

    // ============= ALL GRASS TERRAIN =============

    // Multi-scale detail noise
    vec2 detailUV1 = modelPosition.xz * 0.03;
    vec2 detailUV2 = modelPosition.xz * 0.10;
    vec2 detailUV3 = modelPosition.xz * 0.25;

    float noise1 = texture2D(uNoiseTexture, detailUV1).r;
    float noise2 = texture2D(uNoiseTexture, detailUV2).g;
    float noise3 = texture2D(uNoiseTexture, detailUV3).b;

    // Moisture variation
    float moisture = noise1 * 0.6 + noise2 * 0.4;
    float heightFactor = clamp(elevation / 10.0, 0.0, 1.0);

    // BASE GRASS LAYER
    vec3 grassBase = mix(GRASS_RICH, GRASS_MEADOW, moisture);
    grassBase = mix(grassBase, GRASS_DRY, heightFactor * 0.4);

    // Add fine detail variation
    grassBase += (noise2 - 0.5) * 0.04;
    grassBase = mix(grassBase, grassBase * 0.90, noise3 * 0.15);

    // DIRT PATCHES (very subtle)
    vec3 dirtColor = mix(DIRT_RICH, DIRT_DRY, moisture * 0.7 + 0.3);
    dirtColor += (noise3 - 0.5) * 0.05;

    float dirtFactor = smoothstep(0.60, 0.75, noise1) * (1.0 - slope * 2.0);
    vec3 terrainColor = mix(grassBase, dirtColor, dirtFactor * 0.08);

    // Distance attenuation
    float grassDistanceAttenuation = getGrassAttenuation(modelPosition.xz);
    float grassSlopeAttenuation = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
    float grassAttenuation = grassDistanceAttenuation * grassSlopeAttenuation;

    vec3 baseColor = mix(terrainColor * 0.90, terrainColor, 1.0 - grassAttenuation);

    // ============= ROAD SYSTEM =============
    float roadInfluence = getRoadInfluence(modelPosition.x);
    vec3 color = mix(baseColor, ROAD_COLOR, roadInfluence);

    float laneMarking = getRoadLaneMarking(modelPosition.xyz);
    color = mix(color, LINE_COLOR, laneMarking * roadInfluence);

    // ============= NATURAL LIGHTING =============

    // Natural sun lighting
    float sunShade = getSunShade(normal);
    sunShade = sunShade * 0.60 + 0.40;
    color = getSunShadeColor(color, sunShade);

    // Sky ambient
    float skyLight = normal.y * 0.5 + 0.5;
    vec3 skyColor = vec3(0.40, 0.46, 0.58);
    color += skyColor * skyLight * 0.10;

    // Ambient boost
    color = color * 1.25;

    // Edge lighting
    float rimLight = pow(1.0 - abs(dot(viewDirection, worldNormal)), 3.5);
    color += vec3(0.68, 0.74, 0.85) * rimLight * 0.06;

    // Grass backlight
    float backlight = max(0.0, dot(normal, -uSunPosition));
    color += vec3(0.75, 0.82, 0.58) * backlight * 0.08;

    // Distance fog
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);

    // Very subtle saturation
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = luminance + (color - luminance) * 1.05;

    // Final clamp
    color = clamp(color, vec3(0.0), vec3(1.0));

    vColor = color;
}
