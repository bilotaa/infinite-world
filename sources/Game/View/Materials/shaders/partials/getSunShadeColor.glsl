vec3 getSunShadeColor(vec3 baseColor, float sunShade)
{
    vec3 shadeColor = baseColor;
    return mix(baseColor, shadeColor, sunShade);
}