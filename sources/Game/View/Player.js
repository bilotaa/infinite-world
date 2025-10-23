import * as THREE from 'three'

import Game from '@/Game.js'
import View from '@/View/View.js'
import Debug from '@/Debug/Debug.js'
import State from '@/State/State.js'

export default class Player
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.view = View.getInstance()
        this.debug = Debug.getInstance()

        this.scene = this.view.scene

        this.setGroup()
        this.setHelper()
        this.setDebug()
    }

    setGroup()
    {
        this.group = new THREE.Group()
        this.scene.add(this.group)
    }
    
    setHelper()
    {
        // Create Tesla Cybertruck using Three.js geometries
        this.helper = new THREE.Group()
        
        // Brighter stainless steel material for Cybertruck body
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8, // Brighter silver
            metalness: 0.85,
            roughness: 0.2,
            emissive: 0x666666, // Increased emissive for visibility
            emissiveIntensity: 0.3
        })
        
        // Dark gray material for windows (not pure black)
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.3,
            roughness: 0.6,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.2
        })
        
        // Lighter tire material
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.3,
            roughness: 0.8,
            emissive: 0x111111,
            emissiveIntensity: 0.1
        })
        
        // Brighter wheel rim material
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x444444,
            emissiveIntensity: 0.2
        })
        
        // Create body container for suspension movement
        this.bodyGroup = new THREE.Group()
        this.helper.add(this.bodyGroup)
        
        // TRUCK BED (back part)
        const bed = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 1.2, 3),
            bodyMaterial
        )
        bed.position.set(0, 0.6, 0.5)
        this.bodyGroup.add(bed)
        
        // CABIN (front part) - lower part
        const cabinLower = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 1.0, 2),
            bodyMaterial
        )
        cabinLower.position.set(0, 0.5, -1.5)
        this.bodyGroup.add(cabinLower)
        
        // CABIN - upper part (slanted roof)
        const cabinUpper = new THREE.Mesh(
            new THREE.BoxGeometry(2.3, 0.8, 1.5),
            bodyMaterial
        )
        cabinUpper.position.set(0, 1.3, -1.3)
        cabinUpper.rotation.x = -0.15 // Slight angle for Cybertruck look
        this.bodyGroup.add(cabinUpper)
        
        // WINDSHIELD (angular, dark)
        const windshield = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.7, 0.1),
            windowMaterial
        )
        windshield.position.set(0, 1.2, -2.1)
        windshield.rotation.x = 0.3
        this.bodyGroup.add(windshield)
        
        // SIDE WINDOWS
        const windowLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.6, 1.2),
            windowMaterial
        )
        windowLeft.position.set(-1.15, 1.1, -1.3)
        this.bodyGroup.add(windowLeft)
        
        const windowRight = windowLeft.clone()
        windowRight.position.set(1.15, 1.1, -1.3)
        this.bodyGroup.add(windowRight)
        
        // FRONT HOOD/NOSE
        const hood = new THREE.Mesh(
            new THREE.BoxGeometry(2.3, 0.6, 0.8),
            bodyMaterial
        )
        hood.position.set(0, 0.5, -2.8)
        hood.rotation.x = 0.1
        this.bodyGroup.add(hood)
        
        // WHEELS - Create 4 wheels with animation capability
        const wheelRadius = 0.5
        const wheelWidth = 0.4
        const wheelPositions = [
            { x: -1.2, z: -1.8, name: 'frontLeft' },
            { x: 1.2, z: -1.8, name: 'frontRight' },
            { x: -1.2, z: 1.2, name: 'backLeft' },
            { x: 1.2, z: 1.2, name: 'backRight' }
        ]
        
        // Store wheel references for animation
        this.wheels = []
        
        wheelPositions.forEach(pos => {
            const wheelGroup = new THREE.Group()
            wheelGroup.position.set(pos.x, wheelRadius, pos.z)
            
            // Tire (black cylinder)
            const tire = new THREE.Mesh(
                new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16),
                tireMaterial
            )
            tire.rotation.z = Math.PI / 2
            wheelGroup.add(tire)
            
            // Rim (metallic center)
            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth * 0.6, 8),
                rimMaterial
            )
            rim.rotation.z = Math.PI / 2
            wheelGroup.add(rim)
            
            this.helper.add(wheelGroup)
            this.wheels.push(wheelGroup)
        })
        
        // HEADLIGHTS (glowing strips for Cybertruck look)
        this.headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffee,
            emissive: 0xffffaa,
            emissiveIntensity: 1.2
        })
        
        const headlightLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.1, 0.1),
            this.headlightMaterial
        )
        headlightLeft.position.set(-0.8, 0.6, -3.1)
        this.bodyGroup.add(headlightLeft)
        
        const headlightRight = headlightLeft.clone()
        headlightRight.position.set(0.8, 0.6, -3.1)
        this.bodyGroup.add(headlightRight)
        
        // TAILLIGHTS (red strips) - make them dynamic
        this.taillightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff2222,
            emissive: 0xff0000,
            emissiveIntensity: 0.8
        })
        
        const taillightLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.15, 0.1),
            this.taillightMaterial
        )
        taillightLeft.position.set(-1.0, 0.9, 2.0)
        this.bodyGroup.add(taillightLeft)
        
        const taillightRight = taillightLeft.clone()
        taillightRight.position.set(1.0, 0.9, 2.0)
        this.bodyGroup.add(taillightRight)
        
        // Position entire truck above ground
        this.helper.position.y = 0.2
        
        // Add truck to group
        this.group.add(this.helper)
        
        // Advanced physics tracking
        this.previousRotation = 0
        this.currentTilt = 0
        this.wheelRotation = 0            // Wheel spin animation
        this.suspensionCompression = 0     // Up/down bounce
        this.bodyRoll = 0                  // Side-to-side tilt
        this.bodyPitch = 0                 // Front/back tilt
        this.previousSpeed = 0
        this.previousPosition = { x: 0, z: 0 }
        
        console.log('Tesla Cybertruck created successfully - Premium Edition')
    }

    setDebug()
    {
        if(!this.debug.active)
            return

        // Debug controls can be added here if needed
    }


    update()
    {
        const playerState = this.state.player
        const sunState = this.state.sun
        const time = this.state.time

        this.group.position.set(
            playerState.position.current[0],
            playerState.position.current[1],
            playerState.position.current[2]
        )
        
        // Helper - advanced car mechanics
        if (this.helper) {
            // Initialize previousRotation on first frame
            if (this.previousRotation === 0) {
                this.previousRotation = playerState.rotation
            }
            
            // Calculate rotation difference and normalize to -π to π range
            let rotationDiff = playerState.rotation - this.previousRotation
            
            // Handle angle wrapping (when going from 2π to 0 or vice versa)
            if (rotationDiff > Math.PI) {
                rotationDiff -= Math.PI * 2
            } else if (rotationDiff < -Math.PI) {
                rotationDiff += Math.PI * 2
            }
            
            // Apply main rotation
            this.helper.rotation.y = playerState.rotation
            
            // Calculate speed and acceleration
            const speed = playerState.speed || 0
            const acceleration = (speed - this.previousSpeed) / (time.delta || 0.016)
            
            // ============= WHEEL ROTATION ANIMATION =============
            // Rotate wheels based on speed (realistic rolling)
            const distanceTraveled = speed * time.delta
            const wheelCircumference = Math.PI * 1.0 // 2 * π * radius
            this.wheelRotation += (distanceTraveled / wheelCircumference) * Math.PI * 2
            
            // Apply rotation to all wheels
            this.wheels.forEach((wheel, index) => {
                // Forward/backward rotation
                wheel.rotation.x = this.wheelRotation
                
                // Add slight wobble during drift
                if (playerState.isDrifting) {
                    const wobble = Math.sin(this.wheelRotation * 3) * 0.05
                    wheel.rotation.z = wobble
                } else {
                    wheel.rotation.z *= 0.9 // Smooth back to zero
                }
            })
            
            // ============= BODY ROLL (Weight Transfer) =============
            // Lean into turns
            const targetRoll = -rotationDiff * speed * 0.15
            this.bodyRoll += (targetRoll - this.bodyRoll) * 0.12
            
            // Limit maximum roll
            this.bodyRoll = Math.max(-0.12, Math.min(0.12, this.bodyRoll))
            
            // ============= BODY PITCH (Acceleration/Braking) =============
            // Nose dips when braking, lifts when accelerating
            const targetPitch = -acceleration * 0.015
            this.bodyPitch += (targetPitch - this.bodyPitch) * 0.1
            
            // Limit maximum pitch
            this.bodyPitch = Math.max(-0.08, Math.min(0.08, this.bodyPitch))
            
            // ============= SUSPENSION BOUNCE =============
            // Simulate suspension compression based on terrain and movement
            const verticalAccel = (playerState.position.current[1] - this.previousPosition.y) / (time.delta || 0.016)
            const targetCompression = Math.abs(verticalAccel) * 0.02 + Math.abs(acceleration) * 0.01
            
            this.suspensionCompression += (targetCompression - this.suspensionCompression) * 0.2
            this.suspensionCompression = Math.min(0.15, this.suspensionCompression)
            
            // Natural suspension oscillation (bouncy)
            this.suspensionCompression *= 0.92
            
            // Apply suspension to body (body moves down when compressed)
            this.bodyGroup.position.y = -this.suspensionCompression
            
            // ============= DRIFT TILT =============
            // Extra tilt during drift for dramatic effect
            let driftTilt = 0
            if (playerState.isDrifting) {
                driftTilt = playerState.driftAngle * 0.3
            }
            
            // Calculate target tilt based on turn rate
            const targetTilt = Math.max(-0.06, Math.min(0.06, -rotationDiff * 4)) + driftTilt
            
// Smoothly interpolate current tilt towards target (lerp)
            this.currentTilt += (targetTilt - this.currentTilt) * 0.12
            
            // Apply smooth tilt
            this.helper.rotation.z = this.currentTilt + this.bodyRoll
            
            // Apply pitch (front/back tilt)
            this.bodyGroup.rotation.x = this.bodyPitch
            
            // ============= BRAKE LIGHTS =============
            // Brighten brake lights when decelerating
            if (acceleration < -2) {
                this.taillightMaterial.emissiveIntensity = 1.5
            } else {
                this.taillightMaterial.emissiveIntensity = 0.8
            }
            
            // ============= HEADLIGHT INTENSITY =============
            // Brighten headlights at high speed for dramatic effect
            const speedRatio = speed / 30
            this.headlightMaterial.emissiveIntensity = 1.2 + speedRatio * 0.5
            
            // Store values for next frame
            this.previousRotation = playerState.rotation
            this.previousSpeed = speed
            this.previousPosition = {
                x: playerState.position.current[0],
                y: playerState.position.current[1],
                z: playerState.position.current[2]
            }
        }
    }
}
