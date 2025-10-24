vec3 getFogColor(vec3 baseColor, float depth, vec2 screenUv)
{
    float fogDensity = 0.000008;
    vec3 fogColor = vec3(0.78, 0.84, 0.92);

    float fogFactor = exp(-fogDensity * depth * depth);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    return mix(fogColor, baseColor, fogFactor);
}
