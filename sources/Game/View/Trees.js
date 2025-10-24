import * as THREE from 'three'

import Game from '@/Game.js'
import View from '@/View/View.js'
import State from '@/State/State.js'
import TreeMaterial from './Materials/TreeMaterial.js'

export default class Trees
{
    constructor()
    {
        this.game = Game.getInstance()
        this.view = View.getInstance()
        this.state = State.getInstance()

        this.time = this.state.time
        this.scene = this.view.scene
        this.noises = this.view.noises

        // Tree configuration
        this.treeCount = 150  // Number of trees
        this.spawnRadius = 100 // Spawn trees within this radius
        this.noiseTexture = this.noises.create(128, 128)

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        // Create tree geometry (trunk + foliage cone)
        const trunkRadius = 0.3
        const trunkHeight = 3.0
        const foliageRadius = 2.5
        const foliageHeight = 5.0

        const positions = []
        const colors = []
        const normals = []

        // TRUNK (cylinder with 8 sides)
        const trunkSides = 8
        for (let i = 0; i < trunkSides; i++)
        {
            const angle1 = (i / trunkSides) * Math.PI * 2
            const angle2 = ((i + 1) / trunkSides) * Math.PI * 2

            const x1 = Math.cos(angle1) * trunkRadius
            const z1 = Math.sin(angle1) * trunkRadius
            const x2 = Math.cos(angle2) * trunkRadius
            const z2 = Math.sin(angle2) * trunkRadius

            // Normal for lighting
            const nx = Math.cos((angle1 + angle2) * 0.5)
            const nz = Math.sin((angle1 + angle2) * 0.5)

            // Two triangles per side
            // Triangle 1
            positions.push(x1, 0, z1)
            colors.push(0.35, 0.25, 0.15) // Dark brown trunk
            normals.push(nx, 0, nz)

            positions.push(x2, 0, z2)
            colors.push(0.35, 0.25, 0.15)
            normals.push(nx, 0, nz)

            positions.push(x1, trunkHeight, z1)
            colors.push(0.4, 0.28, 0.18) // Lighter at top
            normals.push(nx, 0, nz)

            // Triangle 2
            positions.push(x2, 0, z2)
            colors.push(0.35, 0.25, 0.15)
            normals.push(nx, 0, nz)

            positions.push(x2, trunkHeight, z2)
            colors.push(0.4, 0.28, 0.18)
            normals.push(nx, 0, nz)

            positions.push(x1, trunkHeight, z1)
            colors.push(0.4, 0.28, 0.18)
            normals.push(nx, 0, nz)
        }

        // FOLIAGE (cone made of triangular segments)
        const foliageSides = 8
        const foliageLevels = 4

        for (let level = 0; level < foliageLevels; level++)
        {
            const y1 = trunkHeight + (level / foliageLevels) * foliageHeight
            const y2 = trunkHeight + ((level + 1) / foliageLevels) * foliageHeight

            const r1 = foliageRadius * (1.0 - level / foliageLevels) * 0.9
            const r2 = foliageRadius * (1.0 - (level + 1) / foliageLevels) * 0.9

            // Green shades - darker at bottom, lighter at top
            const green1 = [0.15 + level * 0.08, 0.35 + level * 0.12, 0.12 + level * 0.05]
            const green2 = [0.15 + (level + 1) * 0.08, 0.35 + (level + 1) * 0.12, 0.12 + (level + 1) * 0.05]

            for (let i = 0; i < foliageSides; i++)
            {
                const angle1 = (i / foliageSides) * Math.PI * 2
                const angle2 = ((i + 1) / foliageSides) * Math.PI * 2

                const x1 = Math.cos(angle1) * r1
                const z1 = Math.sin(angle1) * r1
                const x2 = Math.cos(angle2) * r1
                const z2 = Math.sin(angle2) * r1

                const x3 = Math.cos(angle1) * r2
                const z3 = Math.sin(angle1) * r2
                const x4 = Math.cos(angle2) * r2
                const z4 = Math.sin(angle2) * r2

                // Normal pointing outward and up
                const nx = Math.cos((angle1 + angle2) * 0.5) * 0.7
                const nz = Math.sin((angle1 + angle2) * 0.5) * 0.7
                const ny = 0.3

                // Two triangles per segment
                positions.push(x1, y1, z1)
                colors.push(...green1)
                normals.push(nx, ny, nz)

                positions.push(x2, y1, z2)
                colors.push(...green1)
                normals.push(nx, ny, nz)

                positions.push(x3, y2, z3)
                colors.push(...green2)
                normals.push(nx, ny, nz)

                positions.push(x2, y1, z2)
                colors.push(...green1)
                normals.push(nx, ny, nz)

                positions.push(x4, y2, z4)
                colors.push(...green2)
                normals.push(nx, ny, nz)

                positions.push(x3, y2, z3)
                colors.push(...green2)
                normals.push(nx, ny, nz)
            }
        }

        // Create base geometry
        this.baseGeometry = new THREE.BufferGeometry()
        this.baseGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        this.baseGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        this.baseGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))

        // Create instanced geometry
        this.geometry = new THREE.InstancedBufferGeometry().copy(this.baseGeometry)

        // Instance attributes (position and variation for each tree)
        const instancePositions = new Float32Array(this.treeCount * 3)
        const instanceScales = new Float32Array(this.treeCount)
        const instanceRotations = new Float32Array(this.treeCount)

        // Generate tree positions using procedural placement
        for (let i = 0; i < this.treeCount; i++)
        {
            // Poisson-disc like distribution
            const angle = Math.random() * Math.PI * 2
            const distance = Math.sqrt(Math.random()) * this.spawnRadius

            instancePositions[i * 3 + 0] = Math.cos(angle) * distance
            instancePositions[i * 3 + 1] = 0  // Will be adjusted to terrain height
            instancePositions[i * 3 + 2] = Math.sin(angle) * distance

            // Random scale variation (0.7 to 1.3)
            instanceScales[i] = 0.7 + Math.random() * 0.6

            // Random rotation
            instanceRotations[i] = Math.random() * Math.PI * 2
        }

        this.geometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(instancePositions, 3))
        this.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(instanceScales, 1))
        this.geometry.setAttribute('instanceRotation', new THREE.InstancedBufferAttribute(instanceRotations, 1))
    }

    setMaterial()
    {
        const engineChunks = this.state.chunks
        const engineTerrains = this.state.terrains

        this.material = new TreeMaterial()
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
        this.mesh.visible = false  // Hide until terrain data ready
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

        // Get terrain data for tree positioning
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
