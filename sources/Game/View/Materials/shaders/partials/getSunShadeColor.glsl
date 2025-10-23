vec3 getSunShadeColor(vec3 baseColor, float sunShade)
{
    vec3 shadeColor = baseColor * vec3(0.7, 0.8, 0.9);
    return mix(baseColor, shadeColor, sunShade);
}