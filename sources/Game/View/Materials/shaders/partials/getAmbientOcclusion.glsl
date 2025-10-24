float getAmbientOcclusion(vec3 normal)
{
    float upFacing = normal.y;
    upFacing = upFacing * 0.5 + 0.5;  // Remap from [-1,1] to [0,1]

    float ao = mix(0.85, 1.0, upFacing);  // 0.85 = subtle darkening (down-facing), 1.0 = bright (up-facing)

    return ao;
}
