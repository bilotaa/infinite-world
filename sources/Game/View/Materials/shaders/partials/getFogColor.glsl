vec3 getFogColor(vec3 baseColor, float depth, vec2 screenUv)
{
    float fogDensity = 0.0000005;  // Almost zero fog for maximum visibility
    vec3 fogColor = vec3(0.80, 0.86, 0.94);

    float fogFactor = exp(-fogDensity * depth * depth);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    return mix(fogColor, baseColor, fogFactor);
}
