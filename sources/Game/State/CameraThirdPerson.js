import { vec3, quat2, mat4 } from 'gl-matrix'

import State from '@/State/State.js'

export default class CameraThirdPerson
{
    constructor(player)
    {
        this.state = State.getInstance()
        this.viewport = this.state.viewport
        this.controls = this.state.controls

        this.player = player

        this.active = false
        this.gameUp = vec3.fromValues(0, 1, 0)
        this.position = vec3.create()
        this.quaternion = quat2.create()
        
        // Racing game camera settings
        this.distance = 12              // Distance behind car
        this.height = 4                 // Height above car
        this.aboveOffset = 1.5          // Look at point offset
        this.smoothness = 0.1           // Camera smoothing (lower = smoother)
        
        // Fixed angle for racing game (behind the car)
        this.phi = Math.PI * 0.4        // Slightly elevated view
        this.theta = 0                  // Directly behind (along Z-axis)
        this.phiLimits = { min: 0.1, max: Math.PI - 0.1 }
    }

    activate()
    {
        this.active = true
        // Initialize camera position to avoid snap
        vec3.copy(this.position, this.player.position.current)
        this.position[1] += this.height
        this.position[2] += this.distance
    }

    deactivate()
    {
        this.active = false
    }

    update()
    {
        if(!this.active)
            return

        // Racing game camera: fixed behind the car
        // Calculate ideal camera position behind the car
        const idealPosition = vec3.fromValues(
            this.player.position.current[0],              // Same X as car (centered on road)
            this.player.position.current[1] + this.height, // Fixed height above car
            this.player.position.current[2] + this.distance // Behind the car
        )
        
        // Smooth camera movement (lerp towards ideal position)
        vec3.lerp(this.position, this.position, idealPosition, this.smoothness)

        // Target (look at car)
        const target = vec3.fromValues(
            this.player.position.current[0],
            this.player.position.current[1] + this.aboveOffset,
            this.player.position.current[2]
        )

        // Quaternion
        const toTargetMatrix = mat4.create()
        mat4.targetTo(toTargetMatrix, this.position, target, this.gameUp)
        quat2.fromMat4(this.quaternion, toTargetMatrix)
        
        // Clamp to ground
        const chunks = this.state.chunks
        const elevation = chunks.getElevationForPosition(this.position[0], this.position[2])

        if(elevation !== null && elevation !== undefined && this.position[1] < elevation + 1)
            this.position[1] = elevation + 1
    }
}