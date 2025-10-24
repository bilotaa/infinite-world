import * as THREE from 'three'

import vertexShader from './shaders/tree/vertex.glsl'
import fragmentShader from './shaders/tree/fragment.glsl'

export default function TreeMaterial()
{
    const material = new THREE.ShaderMaterial({
        uniforms:
        {
            uPlayerPosition: { value: null },
            uTerrainSize: { value: null },
            uTerrainTextureSize: { value: null },
            uTerrainTexture: { value: null },
            uTerrainOffset: { value: null },
            uSunPosition: { value: null },
            uNoiseTexture: { value: null }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide
    })

    return material
}
