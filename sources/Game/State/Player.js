import { vec3 } from 'gl-matrix'

import Game from '@/Game.js'
import State from '@/State/State.js'
import Camera from './Camera.js'

export default class Player
{
    constructor(options = {})
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.time = this.state.time
        this.controls = this.state.controls

        // Store player data from homepage
        this.username = options.username || 'Player'
        this.selectedCar = options.carId || 'cybertruck'

        this.rotation = 0
        
        // Ultra-Premium Car Physics Parameters (150 km/h = ~42 m/s = 50 units/s)
        this.acceleration = 0          // Current acceleration
        this.velocity = vec3.create()  // Current velocity vector
        this.maxSpeed = 50             // Maximum speed (150 km/h boost)
        this.normalMaxSpeed = 35       // Normal max speed (~120 km/h)
        this.accelerationRate = 12     // Base acceleration power
        this.decelerationRate = 8      // Braking power
        this.frictionRate = 2.5        // Rolling friction
        this.turnSpeed = 3.0           // Base turn speed
        this.driftFactor = 0.92        // Drift amount
        this.grip = 0.88               // Base tire grip
        this.speedBasedGrip = true     // Dynamic grip system
        
        // Aerodynamics (drag increases with speed²)
        this.dragCoefficient = 0.015   // Air resistance
        this.downforce = 0.02          // High-speed stability
        
        // Weight transfer and suspension
        this.weightTransfer = 0        // Forward/backward weight shift
        this.lateralWeight = 0         // Left/right weight shift
        
        // Drift/skid system
        this.isDrifting = false
        this.driftAngle = 0
        this.skidAmount = 0
        this.tireSlip = 0              // Tire slip percentage
        
        // Gear system (automatic transmission)
        this.currentGear = 1
        this.gearRatios = [0, 3.5, 2.2, 1.5, 1.0, 0.7] // 0=reverse, 1-5=forward gears
        this.gearShiftRPM = [0, 10, 18, 28, 40, 50]    // Speed thresholds for upshift
        this.engineRPM = 1000          // Engine RPM (for simulation)
        
        // Turbo boost system
        this.turboCharge = 0           // Turbo pressure (0-1)
        this.turboActive = false       // Turbo engaged
        
        // G-Force calculation
        this.gForce = { x: 0, y: 0, z: 0 }
        
        // Performance telemetry
        this.topSpeed = 0              // Record top speed
        this.avgSpeed = 0
        this.speedSamples = []
        
        this.speed = 0
        this.targetSpeed = 0
        this.previousVelocity = vec3.create()

        // Road curve parameters (must match Road.js)
        this.roadCurveAmplitude = 40.0
        this.roadCurveFrequency = 0.008
        this.roadCurveFrequency2 = 0.003

        this.position = {}
        // Spawn on curved road
        const spawnZ = 1
        const spawnX = this.getRoadCenterX(spawnZ)
        this.position.current = vec3.fromValues(spawnX, 0, spawnZ)
        this.position.previous = vec3.clone(this.position.current)
        this.position.delta = vec3.create()

        this.camera = new Camera(this)
    }

    // Calculate road center X position for any Z position (must match Road.js)
    getRoadCenterX(z)
    {
        const curve1 = Math.sin(z * this.roadCurveFrequency) * this.roadCurveAmplitude
        const curve2 = Math.sin(z * this.roadCurveFrequency2) * this.roadCurveAmplitude * 0.5
        return curve1 + curve2
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
            
            // Smooth rotation with advanced speed-dependent turning
            let rotationDiff = targetRotation - this.rotation
            
            // Normalize angle difference
            while(rotationDiff > Math.PI) rotationDiff -= Math.PI * 2
            while(rotationDiff < -Math.PI) rotationDiff += Math.PI * 2
            
            // Advanced speed-based turning with downforce
            const speedFactor = Math.max(0.25, 1 - (this.speed / currentMaxSpeed) * 0.7)
            const downforceBonus = this.speed > 25 ? this.downforce * (this.speed - 25) * 0.05 : 0
            const turnRate = (this.turnSpeed + downforceBonus) * speedFactor * delta
            
            // Apply smooth turning
            if(Math.abs(rotationDiff) > turnRate) {
                this.rotation += Math.sign(rotationDiff) * turnRate
            } else {
                this.rotation = targetRotation
            }
            
            // Advanced drift detection with tire slip
            const isDriftInput = Math.abs(rotationDiff) > 0.4 && this.speed > currentMaxSpeed * 0.5
            this.isDrifting = isDriftInput
            this.driftAngle = isDriftInput ? rotationDiff * 0.35 : 0
            this.tireSlip = isDriftInput ? Math.min(1, Math.abs(rotationDiff) * this.speed * 0.03) : 0
            
            // Gear shifting logic (automatic transmission)
            if(inputForward > 0) {
                // Upshift
                if(this.currentGear < 5 && this.speed > this.gearShiftRPM[this.currentGear + 1]) {
                    this.currentGear++
                }
                // Downshift
                if(this.currentGear > 1 && this.speed < this.gearShiftRPM[this.currentGear] - 3) {
                    this.currentGear--
                }
            } else if(inputForward < 0) {
                this.currentGear = 0 // Reverse
            }
            
            // Gear-based acceleration (power varies by gear)
            const gearRatio = this.gearRatios[this.currentGear]
            const gearAcceleration = this.accelerationRate * gearRatio
            
            // Turbo boost system (activated during boost key)
            if(boost && this.speed > 20) {
                this.turboActive = true
                this.turboCharge = Math.min(1, this.turboCharge + delta * 2)
            } else {
                this.turboActive = false
                this.turboCharge = Math.max(0, this.turboCharge - delta * 3)
            }
            
            const turboMultiplier = 1 + this.turboCharge * 0.5
            
            // Target speed calculation
            this.targetSpeed = currentMaxSpeed * (inputForward < 0 ? 0.5 : 1)
            const speedDiff = this.targetSpeed - this.speed
            
            // Advanced acceleration curve with gear ratios
            const accelCurve = 1 - (this.speed / currentMaxSpeed) * 0.4
            this.acceleration = gearAcceleration * accelCurve * turboMultiplier * Math.sign(speedDiff)
            
            // Apply aerodynamic drag (increases with speed²)
            const dragForce = this.dragCoefficient * this.speed * this.speed
            this.acceleration -= dragForce * Math.sign(this.speed)
            
            this.speed += this.acceleration * delta
            this.speed = Math.max(0, Math.min(currentMaxSpeed, this.speed))
            
            // Weight transfer during acceleration/braking
            this.weightTransfer = this.acceleration * 0.04
            this.lateralWeight = rotationDiff * this.speed * 0.06
        }
        else
        {
            // Deceleration when no input (with aerodynamic drag)
            if(this.speed > 0.1) {
                const dragForce = this.dragCoefficient * this.speed * this.speed
                this.speed -= (this.decelerationRate + dragForce) * delta
                this.speed = Math.max(0, this.speed)
                this.weightTransfer = -(this.decelerationRate + dragForce) * 0.02
            } else {
                this.speed = 0
                this.weightTransfer = 0
            }
            
            // Idle gear
            if(this.speed < 2 && this.currentGear > 1) {
                this.currentGear = 1
            }
            
            this.isDrifting = false
            this.driftAngle = 0
            this.tireSlip = 0
            this.lateralWeight *= 0.92
            this.turboActive = false
            this.turboCharge *= 0.95
        }
        
        // Apply rolling friction
        this.speed *= Math.pow(1 - (this.frictionRate * 0.08), delta)
        
        // Engine RPM simulation (for visual/audio feedback)
        const gearRPMBase = this.currentGear > 0 ? 1500 + (this.speed / this.gearRatios[this.currentGear]) * 150 : 1000
        this.engineRPM = gearRPMBase + this.turboCharge * 500
        
        // Calculate velocity with advanced drift physics
        const moveRotation = this.rotation + this.driftAngle
        
        // Dynamic grip with tire slip and aerodynamics
        let currentGrip = this.grip
        if(this.speedBasedGrip) {
            currentGrip = this.grip - (this.speed / currentMaxSpeed) * 0.15
            currentGrip += this.downforce * (this.speed / currentMaxSpeed) * 0.1 // Downforce improves grip at speed
        }
        currentGrip = Math.max(0.6, Math.min(0.95, currentGrip))
        currentGrip -= this.tireSlip * 0.3 // Slip reduces grip
        
        // Calculate target velocity
        const targetVelocity = vec3.fromValues(
            -Math.sin(moveRotation) * this.speed,
            0,
            -Math.cos(moveRotation) * this.speed
        )
        
        // Apply advanced drift physics with momentum preservation
        this.velocity[0] += (targetVelocity[0] - this.velocity[0]) * currentGrip
        this.velocity[2] += (targetVelocity[2] - this.velocity[2]) * currentGrip
        
        // Calculate G-Forces (for visual effects)
        const velocityChange = vec3.create()
        vec3.sub(velocityChange, this.velocity, this.previousVelocity)
        vec3.scale(velocityChange, velocityChange, 1 / (delta || 0.016))
        
        this.gForce.x = velocityChange[0] * 0.1 // Lateral G
        this.gForce.z = velocityChange[2] * 0.1 // Longitudinal G
        
        vec3.copy(this.previousVelocity, this.velocity)
        
        // Skid calculation
        this.skidAmount = Math.abs(this.driftAngle) * this.speed * 0.5 + this.tireSlip * 10
        
        // Apply velocity to position
        this.position.current[0] += this.velocity[0] * delta
        this.position.current[2] += this.velocity[2] * delta

        vec3.sub(this.position.delta, this.position.current, this.position.previous)
        vec3.copy(this.position.previous, this.position.current)
        
        // Performance telemetry
        this.topSpeed = Math.max(this.topSpeed, this.speed)
        this.speedSamples.push(this.speed)
        if(this.speedSamples.length > 100) this.speedSamples.shift()
        this.avgSpeed = this.speedSamples.reduce((a, b) => a + b, 0) / this.speedSamples.length
        
        // Update view
        this.camera.update()

        // Update elevation with smooth suspension
        const chunks = this.state.chunks
        const elevation = chunks.getElevationForPosition(this.position.current[0], this.position.current[2])

        if(elevation !== null && elevation !== undefined) {
            this.position.current[1] = elevation + 0.52
        } else {
            this.position.current[1] = 0.52
        }
    }
    
    // Convert speed to km/h for display
    getSpeedKmH()
    {
        // 1 unit/s = 3 km/h (calibrated for 150 km/h at max)
        return Math.round(this.speed * 3)
    }
}