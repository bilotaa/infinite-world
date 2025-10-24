uniform vec3 uSunPosition;

varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main()
{
    // Base color from vertex
    vec3 color = vColor;

    // Normalize normal
    vec3 normal = normalize(vNormal);

    // Sun lighting (diffuse)
    float sunDot = dot(normal, -uSunPosition);
    float sunShade = sunDot * 0.5 + 0.5;
    sunShade = sunShade * 0.7 + 0.3;  // Soften shadows

    // Apply sun shading
    color *= sunShade;

    // Ambient sky light
    float skyLight = (normal.y * 0.5 + 0.5) * 0.3;
    color += vec3(0.4, 0.5, 0.7) * skyLight;

    // Ambient boost
    color *= 1.3;

    // Rim lighting for depth
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float rim = 1.0 - abs(dot(viewDir, normal));
    rim = pow(rim, 3.0);
    color += vec3(0.7, 0.8, 1.0) * rim * 0.08;

    // Clamp
    color = clamp(color, vec3(0.0), vec3(1.0));

    gl_FragColor = vec4(color, 1.0);
}
