import { vec3 } from 'gl-matrix'

import Game from '@/Game.js'
import State from '@/State/State.js'
import Camera from './Camera.js'

export default class Player
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.time = this.state.time
        this.controls = this.state.controls

        this.rotation = 0
        
        // Advanced Car Physics Parameters
        this.acceleration = 0          // Current acceleration
        this.velocity = vec3.create()  // Current velocity vector
        this.maxSpeed = 30             // Maximum speed (boost)
        this.normalMaxSpeed = 15       // Normal max speed
        this.accelerationRate = 8      // How fast we accelerate
        this.decelerationRate = 6      // How fast we slow down
        this.frictionRate = 3          // Natural friction when no input
        this.turnSpeed = 2.5           // How fast we can turn
        this.driftFactor = 0.92        // Drift amount (0.9-0.99, lower = more drift)
        this.grip = 0.88               // Tire grip (higher = less slide)
        this.speedBasedGrip = true     // Grip decreases at high speed
        
        // Weight transfer and suspension
        this.weightTransfer = 0        // Forward/backward weight shift
        this.lateralWeight = 0         // Left/right weight shift
        
        // Drift/skid system
        this.isDrifting = false
        this.driftAngle = 0
        this.skidAmount = 0
        
        this.speed = 0
        this.targetSpeed = 0

        this.position = {}
        this.position.current = vec3.fromValues(10, 0, 1)
        this.position.previous = vec3.clone(this.position.current)
        this.position.delta = vec3.create()

        this.camera = new Camera(this)
    }

    update()
    {
        const delta = this.time.delta
        const boost = this.controls.keys.down.boost
        const currentMaxSpeed = boost ? this.maxSpeed : this.normalMaxSpeed
        
        // Calculate input direction
        let inputForward = 0
        let inputStrafe = 0
        
        if(this.controls.keys.down.forward) inputForward = 1
        if(this.controls.keys.down.backward) inputForward = -1
        if(this.controls.keys.down.strafeLeft) inputStrafe = -1
        if(this.controls.keys.down.strafeRight) inputStrafe = 1
        
        const hasInput = inputForward !== 0 || inputStrafe !== 0
        
        if(this.camera.mode !== Camera.MODE_FLY && hasInput)
        {
            // Calculate target rotation based on camera and input
            let targetRotation = this.camera.thirdPerson.theta
            
            if(inputForward > 0) {
                if(inputStrafe < 0) targetRotation += Math.PI * 0.25
                else if(inputStrafe > 0) targetRotation -= Math.PI * 0.25
            }
            else if(inputForward < 0) {
                if(inputStrafe < 0) targetRotation += Math.PI * 0.75
                else if(inputStrafe > 0) targetRotation -= Math.PI * 0.75
                else targetRotation -= Math.PI
            }
            else if(inputStrafe < 0) {
                targetRotation += Math.PI * 0.5
            }
            else if(inputStrafe > 0) {
                targetRotation -= Math.PI * 0.5
            }
            
            // Smooth rotation with speed-dependent turning
            let rotationDiff = targetRotation - this.rotation
            
            // Normalize angle difference
            while(rotationDiff > Math.PI) rotationDiff -= Math.PI * 2
            while(rotationDiff < -Math.PI) rotationDiff += Math.PI * 2
            
            // Speed-based turning (harder to turn at high speed)
            const speedFactor = Math.max(0.3, 1 - (this.speed / currentMaxSpeed) * 0.6)
            const turnRate = this.turnSpeed * speedFactor * delta
            
            // Apply smooth turning
            if(Math.abs(rotationDiff) > turnRate) {
                this.rotation += Math.sign(rotationDiff) * turnRate
            } else {
                this.rotation = targetRotation
            }
            
            // Detect drifting (sharp turns at high speed)
            const isDriftInput = Math.abs(rotationDiff) > 0.5 && this.speed > currentMaxSpeed * 0.6
            this.isDrifting = isDriftInput
            this.driftAngle = isDriftInput ? rotationDiff * 0.4 : 0
            
            // Acceleration (with realistic curve)
            this.targetSpeed = currentMaxSpeed * (inputForward < 0 ? 0.6 : 1) // Slower reverse
            const speedDiff = this.targetSpeed - this.speed
            
            // Acceleration curve (easier to accelerate at low speed)
            const accelCurve = 1 - (this.speed / currentMaxSpeed) * 0.5
            this.acceleration = this.accelerationRate * accelCurve * Math.sign(speedDiff)
            
            this.speed += this.acceleration * delta
            this.speed = Math.max(0, Math.min(currentMaxSpeed, this.speed))
            
            // Weight transfer during acceleration/braking
            this.weightTransfer = this.acceleration * 0.03
            this.lateralWeight = rotationDiff * this.speed * 0.05
        }
        else
        {
            // Deceleration when no input
            if(this.speed > 0.1) {
                this.speed -= this.decelerationRate * delta
                this.speed = Math.max(0, this.speed)
                this.weightTransfer = -this.decelerationRate * 0.02
            } else {
                this.speed = 0
                this.weightTransfer = 0
            }
            
            this.isDrifting = false
            this.driftAngle = 0
            this.lateralWeight *= 0.9
        }
        
        // Apply friction
        this.speed *= Math.pow(1 - (this.frictionRate * 0.1), delta)
        
        // Calculate velocity with drift
        const moveRotation = this.rotation + this.driftAngle
        
        // Dynamic grip based on speed
        let currentGrip = this.grip
        if(this.speedBasedGrip) {
            currentGrip = this.grip + (1 - this.grip) * (this.speed / currentMaxSpeed) * 0.3
        }
        
        // Calculate target velocity
        const targetVelocity = vec3.fromValues(
            -Math.sin(moveRotation) * this.speed,
            0,
            -Math.cos(moveRotation) * this.speed
        )
        
        // Apply drift physics (velocity doesn't instantly match direction)
        this.velocity[0] += (targetVelocity[0] - this.velocity[0]) * currentGrip
        this.velocity[2] += (targetVelocity[2] - this.velocity[2]) * currentGrip
        
        // Skid calculation (difference between direction and velocity)
        this.skidAmount = Math.abs(this.driftAngle) * this.speed * 0.5
        
        // Apply velocity to position
        this.position.current[0] += this.velocity[0] * delta
        this.position.current[2] += this.velocity[2] * delta

        vec3.sub(this.position.delta, this.position.current, this.position.previous)
        vec3.copy(this.position.previous, this.position.current)
        
        // Update view
        this.camera.update()

        // Update elevation with smooth suspension
        const chunks = this.state.chunks
        const elevation = chunks.getElevationForPosition(this.position.current[0], this.position.current[2])

        if(elevation !== null && elevation !== undefined) {
            this.position.current[1] = elevation
        } else {
            this.position.current[1] = 0
        }
    }
}