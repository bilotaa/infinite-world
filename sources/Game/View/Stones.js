import * as THREE from 'three'

import Game from '@/Game.js'
import View from '@/View/View.js'
import State from '@/State/State.js'
import StoneMaterial from './Materials/StoneMaterial.js'

export default class Stones
{
    constructor()
    {
        this.game = Game.getInstance()
        this.view = View.getInstance()
        this.state = State.getInstance()

        this.time = this.state.time
        this.scene = this.view.scene
        this.noises = this.view.noises

        // Stone configuration
        this.stoneCount = 120  // Reduced for better performance (was 200)
        this.spawnRadius = 150 // Wide distribution
        this.noiseTexture = this.noises.create(128, 128)

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        const positions = []
        const colors = []
        const normals = []

        // Create a medium-detail stone (irregular rock shape)
        // Using icosphere-like approach with deformation

        const createStone = (baseRadius, segments) => {
            // Start with octahedron and subdivide for organic rock
            const vertices = []
            const faces = []

            // Octahedron base vertices
            const t = 1.0
            vertices.push(
                [0, t, 0], [0, -t, 0],
                [t, 0, 0], [-t, 0, 0],
                [0, 0, t], [0, 0, -t]
            )

            // Octahedron faces
            faces.push(
                [0, 4, 2], [0, 2, 5], [0, 5, 3], [0, 3, 4],
                [1, 2, 4], [1, 5, 2], [1, 3, 5], [1, 4, 3]
            )

            // Add faces to geometry with deformation for natural rock look
            for (const face of faces) {
                const v1 = vertices[face[0]]
                const v2 = vertices[face[1]]
                const v3 = vertices[face[2]]

                // Normalize and deform vertices for rock shape
                const deform = (v, scale) => {
                    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
                    const rand = Math.random() * 0.3 + 0.85 // Random variation
                    return [
                        v[0] / len * scale * rand,
                        v[1] / len * scale * rand * 0.7, // Flatter
                        v[2] / len * scale * rand
                    ]
                }

                const dv1 = deform(v1, baseRadius)
                const dv2 = deform(v2, baseRadius)
                const dv3 = deform(v3, baseRadius)

                // Calculate face normal
                const ux = dv2[0] - dv1[0]
                const uy = dv2[1] - dv1[1]
                const uz = dv2[2] - dv1[2]
                const vx = dv3[0] - dv1[0]
                const vy = dv3[1] - dv1[1]
                const vz = dv3[2] - dv1[2]

                const nx = uy * vz - uz * vy
                const ny = uz * vx - ux * vz
                const nz = ux * vy - uy * vx
                const nlen = Math.sqrt(nx*nx + ny*ny + nz*nz)

                // Rock colors (grey granite with variation)
                const baseGrey = 0.40 + Math.random() * 0.15
                const colorVar = Math.random() * 0.05
                const rockColor = [
                    baseGrey + colorVar,
                    baseGrey + colorVar * 0.9,
                    baseGrey + colorVar * 0.85
                ]

                // Add triangle
                positions.push(...dv1, ...dv2, ...dv3)
                normals.push(
                    nx/nlen, ny/nlen, nz/nlen,
                    nx/nlen, ny/nlen, nz/nlen,
                    nx/nlen, ny/nlen, nz/nlen
                )
                colors.push(...rockColor, ...rockColor, ...rockColor)
            }

            // Add more detail - subdivide each face once for medium detail
            const existingFaceCount = faces.length * 3
            for (let i = 0; i < existingFaceCount; i += 9) {
                const v1 = [positions[i], positions[i+1], positions[i+2]]
                const v2 = [positions[i+3], positions[i+4], positions[i+5]]
                const v3 = [positions[i+6], positions[i+7], positions[i+8]]

                // Midpoints
                const m1 = [(v1[0]+v2[0])/2, (v1[1]+v2[1])/2, (v1[2]+v2[2])/2]
                const m2 = [(v2[0]+v3[0])/2, (v2[1]+v3[1])/2, (v2[2]+v3[2])/2]
                const m3 = [(v3[0]+v1[0])/2, (v3[1]+v1[1])/2, (v3[2]+v1[2])/2]

                // Add slight randomness to midpoints for rock texture
                m1[0] += (Math.random() - 0.5) * 0.1
                m1[1] += (Math.random() - 0.5) * 0.1
                m1[2] += (Math.random() - 0.5) * 0.1

                const n = [normals[i], normals[i+1], normals[i+2]]
                const c = [colors[i], colors[i+1], colors[i+2]]

                // Add 3 new triangles (center triangle)
                positions.push(...m1, ...m2, ...m3)
                normals.push(...n, ...n, ...n)
                colors.push(...c, ...c, ...c)
            }
        }

        // Create stone geometry
        createStone(1.0, 2)

        // Create base geometry
        this.baseGeometry = new THREE.BufferGeometry()
        this.baseGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        this.baseGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        this.baseGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))

        // Create instanced geometry
        this.geometry = new THREE.InstancedBufferGeometry().copy(this.baseGeometry)

        // Instance attributes
        const instancePositions = new Float32Array(this.stoneCount * 3)
        const instanceScales = new Float32Array(this.stoneCount * 3)
        const instanceRotations = new Float32Array(this.stoneCount)

        // Generate stone positions
        for (let i = 0; i < this.stoneCount; i++)
        {
            // Random distribution
            const angle = Math.random() * Math.PI * 2
            const distance = Math.sqrt(Math.random()) * this.spawnRadius

            instancePositions[i * 3 + 0] = Math.cos(angle) * distance
            instancePositions[i * 3 + 1] = 0
            instancePositions[i * 3 + 2] = Math.sin(angle) * distance

            // Random scale (0.5 to 2.5 - variety of sizes)
            const baseScale = 0.5 + Math.random() * 2.0
            instanceScales[i * 3 + 0] = baseScale * (0.8 + Math.random() * 0.4) // width
            instanceScales[i * 3 + 1] = baseScale * (0.6 + Math.random() * 0.3) // height (flatter)
            instanceScales[i * 3 + 2] = baseScale * (0.8 + Math.random() * 0.4) // depth

            // Random rotation
            instanceRotations[i] = Math.random() * Math.PI * 2
        }

        this.geometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(instancePositions, 3))
        this.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(instanceScales, 3))
        this.geometry.setAttribute('instanceRotation', new THREE.InstancedBufferAttribute(instanceRotations, 1))
    }

    setMaterial()
    {
        const engineChunks = this.state.chunks
        const engineTerrains = this.state.terrains

        this.material = new StoneMaterial()
        this.material.uniforms.uPlayerPosition.value = new THREE.Vector3()
        this.material.uniforms.uTerrainSize.value = engineChunks.minSize
        this.material.uniforms.uTerrainTextureSize.value = engineTerrains.segments
        this.material.uniforms.uTerrainTexture.value = null
        this.material.uniforms.uTerrainOffset.value = new THREE.Vector2()
        this.material.uniforms.uSunPosition.value = new THREE.Vector3(-0.5, -0.5, -0.5)
        this.material.uniforms.uNoiseTexture.value = this.noiseTexture
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.frustumCulled = false
        this.mesh.visible = false
        this.scene.add(this.mesh)
    }

    update()
    {
        const playerState = this.state.player
        const playerPosition = playerState.position.current
        const engineChunks = this.state.chunks
        const sunState = this.state.sun

        this.material.uniforms.uSunPosition.value.set(sunState.position.x, sunState.position.y, sunState.position.z)
        this.mesh.position.set(playerPosition[0], 0, playerPosition[2])
        this.material.uniforms.uPlayerPosition.value.set(playerPosition[0], playerPosition[1], playerPosition[2])

        // Get terrain data
        const chunkState = engineChunks.getDeepestChunkForPosition(playerPosition[0], playerPosition[2])

        if (chunkState && chunkState.terrain && chunkState.terrain.renderInstance.texture)
        {
            this.mesh.visible = true

            this.material.uniforms.uTerrainTexture.value = chunkState.terrain.renderInstance.texture
            this.material.uniforms.uTerrainOffset.value.set(
                chunkState.x - chunkState.size * 0.5,
                chunkState.z - chunkState.size * 0.5
            )
        }
    }
}
