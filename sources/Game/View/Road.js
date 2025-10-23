import * as THREE from 'three'

import Game from '@/Game.js'
import View from '@/View/View.js'
import State from '@/State/State.js'
import RoadMaterial from './Materials/RoadMaterial.js'

export default class Road
{
    constructor()
    {
        this.game = Game.getInstance()
        this.view = View.getInstance()
        this.state = State.getInstance()

        this.scene = this.view.scene
        this.chunks = this.state.chunks

        this.roadWidth = 16.0
        this.roadSegments = 200
        this.chunkSize = this.state.chunks.minSize

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        // Create road geometry - plane along Z axis
        this.geometry = new THREE.PlaneGeometry(
            this.roadWidth,           // Width (X axis)
            this.chunkSize,          // Length (Z axis)
            4,                       // Width segments
            this.roadSegments        // Length segments for terrain following
        )

        // Rotate to be horizontal
        this.geometry.rotateX(-Math.PI / 2)
    }

    setMaterial()
    {
        this.material = new RoadMaterial()
        this.material.uniforms.uTime.value = 0
        this.material.uniforms.uRoadWidth.value = this.roadWidth
        this.material.side = THREE.DoubleSide
        this.material.depthWrite = true
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.frustumCulled = false
        this.mesh.renderOrder = 1  // Render after terrain
        this.scene.add(this.mesh)
    }

    update()
    {
        const playerState = this.state.player
        const playerPosition = playerState.position.current

        // Keep road centered on player
        this.mesh.position.set(0, 0, playerPosition[2])

        // Sample terrain height and update road geometry to follow terrain
        const positions = this.geometry.attributes.position.array

        for (let i = 0; i < positions.length; i += 3)
        {
            const localX = positions[i]
            const localZ = positions[i + 2]

            // World position
            const worldX = this.mesh.position.x + localX
            const worldZ = this.mesh.position.z + localZ

            // Get terrain height at this position
            const terrainHeight = this.chunks.getElevationForPosition(worldX, worldZ)

            // Set road height slightly above terrain
            if (terrainHeight !== null) {
                positions[i + 1] = terrainHeight + 0.52  // Slightly above road surface
            }
        }

        this.geometry.attributes.position.needsUpdate = true
        this.geometry.computeVertexNormals()
    }
}
