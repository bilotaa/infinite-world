uniform vec3 uPlayerPosition;
uniform float uTerrainSize;
uniform float uTerrainTextureSize;
uniform sampler2D uTerrainTexture;
uniform vec2 uTerrainOffset;
uniform vec3 uSunPosition;
uniform sampler2D uNoiseTexture;

attribute vec3 instancePosition;
attribute float instanceScale;
attribute float instanceRotation;
attribute vec3 color;

varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main()
{
    // Apply instance rotation
    float cosR = cos(instanceRotation);
    float sinR = sin(instanceRotation);
    vec3 rotatedPosition = vec3(
        position.x * cosR - position.z * sinR,
        position.y,
        position.x * sinR + position.z * cosR
    );

    // Apply instance scale
    vec3 scaledPosition = rotatedPosition * instanceScale;

    // Get world position of tree instance
    vec3 worldInstancePos = instancePosition + vec3(uPlayerPosition.x, 0.0, uPlayerPosition.z);

    // Sample terrain height
    vec2 terrainUV = (worldInstancePos.xz - uTerrainOffset) / uTerrainSize;
    float fragmentSize = 1.0 / uTerrainTextureSize;
    vec4 terrainData = texture2D(uTerrainTexture, terrainUV * (1.0 - fragmentSize) + fragmentSize * 0.5);
    float terrainHeight = terrainData.a;
    vec3 terrainNormal = terrainData.rgb;

    // Calculate slope (hide trees on steep slopes)
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), terrainNormal));
    float slopeHide = step(slope, 0.4);  // Hide on slopes > 0.4

    // Check if in valid terrain UV range
    float inBounds = step(0.0, terrainUV.x) * step(terrainUV.x, 1.0) * step(0.0, terrainUV.y) * step(terrainUV.y, 1.0);

    // World position with terrain height
    vec3 worldPosition = worldInstancePos + vec3(0.0, terrainHeight, 0.0) + scaledPosition;

    // Apply visibility (hide out of bounds or on steep slopes)
    float visibility = inBounds * slopeHide;
    worldPosition = mix(vec3(0.0, -1000.0, 0.0), worldPosition, visibility);

    // Transform for rendering
    vec4 modelPosition = vec4(worldPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Rotate normal
    mat3 rotationMatrix = mat3(
        cosR, 0.0, -sinR,
        0.0, 1.0, 0.0,
        sinR, 0.0, cosR
    );
    vec3 rotatedNormal = rotationMatrix * normal;

    // Pass to fragment shader
    vColor = color;
    vNormal = rotatedNormal;
    vWorldPosition = worldPosition;
}
