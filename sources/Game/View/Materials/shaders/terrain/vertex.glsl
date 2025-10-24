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

// PHOTOREALISTIC TERRAIN COLORS
const vec3 GRASS_BRIGHT = vec3(0.45, 0.62, 0.25);      // Bright meadow grass
const vec3 GRASS_DARK = vec3(0.25, 0.45, 0.18);        // Shadow grass
const vec3 DIRT_COLOR = vec3(0.42, 0.32, 0.22);        // Rich soil
const vec3 ROCK_DARK = vec3(0.35, 0.35, 0.38);         // Dark granite
const vec3 ROCK_LIGHT = vec3(0.65, 0.62, 0.58);        // Light granite
const vec3 SNOW_COLOR = vec3(0.95, 0.96, 0.98);        // Pure snow
const vec3 SNOW_SHADOW = vec3(0.75, 0.80, 0.88);       // Snow in shadow

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

    // ============= PHOTOREALISTIC TERRAIN SYSTEM =============

    // Multi-scale procedural noise for detail
    vec2 detailUV1 = modelPosition.xz * 0.05;
    vec2 detailUV2 = modelPosition.xz * 0.15;
    vec2 detailUV3 = modelPosition.xz * 0.4;

    float noise1 = texture2D(uNoiseTexture, detailUV1).r;
    float noise2 = texture2D(uNoiseTexture, detailUV2).g;
    float noise3 = texture2D(uNoiseTexture, detailUV3).b;

    // Combine noise for rich detail
    float detailNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;

    // Moisture variation (affects grass color)
    float moisture = noise1 * 0.6 + noise2 * 0.4;

    // Height-based biomes
    float heightFactor = clamp((elevation + 8.0) / 16.0, 0.0, 1.0);

    // GRASS LAYER (low elevation, flat areas)
    vec3 grassVariation = mix(GRASS_DARK, GRASS_BRIGHT, moisture);
    grassVariation = mix(grassVariation, grassVariation * 0.8, detailNoise * 0.15); // Add variation

    // DIRT LAYER (mid slopes, patches)
    vec3 dirtColor = DIRT_COLOR * (0.9 + detailNoise * 0.2); // Dirt variation

    // ROCK LAYER (steep slopes)
    vec3 rockColor = mix(ROCK_DARK, ROCK_LIGHT, noise2);
    rockColor = mix(rockColor, rockColor * 0.85, noise3 * 0.3); // Rock variation and cracks

    // SNOW LAYER (high elevation)
    vec3 snowColor = mix(SNOW_SHADOW, SNOW_COLOR, 0.5 + noise1 * 0.5);

    // ============= TERRAIN BLENDING =============

    // Start with grass
    vec3 terrainColor = grassVariation;

    // Add dirt patches on flat areas (procedural)
    float dirtAmount = smoothstep(0.4, 0.6, noise1) * (1.0 - slope);
    terrainColor = mix(terrainColor, dirtColor, dirtAmount * 0.3);

    // Blend to rock on slopes
    float rockBlend = smoothstep(0.25, 0.5, slope);
    terrainColor = mix(terrainColor, rockColor, rockBlend);

    // Add snow on high elevations (mountains)
    float snowLine = 6.0; // Snow starts at elevation 6
    float snowBlend = smoothstep(snowLine, snowLine + 3.0, elevation);
    snowBlend *= (1.0 - slope * 0.3); // Less snow on steep slopes
    terrainColor = mix(terrainColor, snowColor, snowBlend);

    // Grass distance attenuation
    float grassDistanceAttenuation = getGrassAttenuation(modelPosition.xz);
    float grassSlopeAttenuation = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
    float grassAttenuation = grassDistanceAttenuation * grassSlopeAttenuation;

    vec3 baseColor = mix(terrainColor * 0.9, terrainColor, 1.0 - grassAttenuation);

    // ============= ROAD SYSTEM =============
    float roadInfluence = getRoadInfluence(modelPosition.x);
    vec3 color = mix(baseColor, ROAD_COLOR, roadInfluence);

    float laneMarking = getRoadLaneMarking(modelPosition.xyz);
    color = mix(color, LINE_COLOR, laneMarking * roadInfluence);

    // ============= LIGHTING SYSTEM (PBR-style) =============

    // Diffuse sun lighting
    float sunShade = getSunShade(normal);
    sunShade = sunShade * 0.7 + 0.3; // Softer shadows
    color = getSunShadeColor(color, sunShade);

    // Ambient light (simulates sky lighting)
    float skyLight = normal.y * 0.5 + 0.5; // Up-facing surfaces get more sky light
    vec3 skyColor = vec3(0.4, 0.5, 0.7);
    color += skyColor * skyLight * 0.15;

    // Strong ambient boost for visibility
    color = color * 1.4;

    // Rim lighting (light from edges - makes terrain pop)
    float rimLight = pow(1.0 - abs(dot(viewDirection, worldNormal)), 3.0);
    color += vec3(0.8, 0.9, 1.0) * rimLight * 0.12;

    // Specular highlights on wet/rocky areas
    float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
    sunReflection *= rockBlend * 0.5; // Only rocks are shiny
    color = getSunReflectionColor(color, sunReflection);

    // Subsurface scattering on grass (backlit glow)
    float backlight = max(0.0, dot(normal, -uSunPosition));
    if (backlight > 0.0 && rockBlend < 0.5 && snowBlend < 0.5) {
        color += vec3(0.9, 1.0, 0.7) * backlight * 0.15 * (1.0 - rockBlend);
    }

    // ============= ATMOSPHERIC EFFECTS =============

    // Height-based atmospheric tint (higher = more atmospheric blue)
    float atmosphericTint = clamp(elevation / 15.0, 0.0, 0.3);
    color = mix(color, color * vec3(0.85, 0.9, 1.1), atmosphericTint);

    // Distance fog
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);

    // Color grading - boost saturation
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = luminance + (color - luminance) * 1.2;

    // Final clamp
    color = clamp(color, vec3(0.0), vec3(1.0));

    vColor = color;
}
