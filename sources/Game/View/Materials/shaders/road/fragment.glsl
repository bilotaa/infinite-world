uniform float uTime;
uniform float uRoadWidth;

varying vec3 vWorldPosition;
varying vec3 vNormal;

void main()
{
    float x = vWorldPosition.x;
    float z = vWorldPosition.z;

    // Base road color - dark grey asphalt
    vec3 roadColor = vec3(0.35, 0.35, 0.35);
    vec3 lineColor = vec3(1.0, 1.0, 1.0);

    // Lane marking parameters
    float centerLineWidth = 1.0;
    float edgeLineWidth = 0.8;
    float dashLength = 5.0;
    float dashGap = 2.0;
    float edgeLinePos = 7.0;

    // Initialize marking
    float marking = 0.0;

    // Center dashed line
    float distFromCenter = abs(x);
    if (distFromCenter < centerLineWidth * 0.5) {
        float dashCycle = dashLength + dashGap;
        float zMod = mod(z, dashCycle);
        if (zMod < dashLength) {
            marking = 1.0;
        }
    }

    // Left edge line (solid)
    float distFromLeft = abs(x + edgeLinePos);
    if (distFromLeft < edgeLineWidth * 0.5) {
        marking = 1.0;
    }

    // Right edge line (solid)
    float distFromRight = abs(x - edgeLinePos);
    if (distFromRight < edgeLineWidth * 0.5) {
        marking = 1.0;
    }

    // Mix road and line colors
    vec3 finalColor = mix(roadColor, lineColor, marking);

    // Simple lighting based on normal
    float lighting = dot(vNormal, normalize(vec3(0.5, 1.0, 0.3))) * 0.5 + 0.5;
    finalColor *= lighting;

    gl_FragColor = vec4(finalColor, 1.0);
}
