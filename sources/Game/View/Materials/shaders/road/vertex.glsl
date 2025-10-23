uniform float uTime;
uniform float uRoadWidth;

varying vec3 vWorldPosition;
varying vec3 vNormal;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    vWorldPosition = modelPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
}
