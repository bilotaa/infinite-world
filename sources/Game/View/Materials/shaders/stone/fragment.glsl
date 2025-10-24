uniform vec3 uSunPosition;

varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main()
{
    // Base stone color
    vec3 color = vColor;

    // Normalize normal
    vec3 normal = normalize(vNormal);

    // Sun lighting (diffuse)
    float sunDot = dot(normal, -uSunPosition);
    float sunShade = sunDot * 0.5 + 0.5;
    sunShade = sunShade * 0.6 + 0.4;  // Very soft shadows (game-style)

    // Apply sun shading
    color *= sunShade;

    // Sky ambient
    float skyLight = (normal.y * 0.5 + 0.5) * 0.25;
    color += vec3(0.38, 0.44, 0.56) * skyLight;

    // High ambient boost (game-style bright)
    color *= 1.6;

    // Rim lighting (subtle)
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float rim = 1.0 - abs(dot(viewDir, normal));
    rim = pow(rim, 3.0);
    color += vec3(0.65, 0.70, 0.80) * rim * 0.06;

    // Add bright moss tint on top surfaces (bright green for game-style)
    float upFacing = max(0.0, normal.y);
    vec3 mossColor = vec3(0.45, 0.60, 0.35);  // Brighter lime-green moss
    color = mix(color, color * 0.7 + mossColor * 0.3, upFacing * 0.15);

    // Boost saturation for vibrant game look
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = luminance + (color - luminance) * 1.15;

    // Clamp
    color = clamp(color, vec3(0.0), vec3(1.0));

    gl_FragColor = vec4(color, 1.0);
}
