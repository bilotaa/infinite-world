import * as THREE from 'three'

import vertex from './shaders/road/vertex.glsl'
import fragment from './shaders/road/fragment.glsl'

export default class RoadMaterial extends THREE.ShaderMaterial
{
    constructor()
    {
        super({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uTime: { value: 0 },
                uRoadWidth: { value: 16.0 }
            },
            transparent: false,
            depthWrite: true
        })
    }
}
