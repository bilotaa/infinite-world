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
        this.bodyMaterial = new THREE.MeshStandardMaterial({
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
            this.bodyMaterial
        )
        bed.position.set(0, 0.6, 0.5)
        this.bodyGroup.add(bed)
        
        // CABIN (front part) - lower part
        const cabinLower = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 1.0, 2),
            this.bodyMaterial
        )
        cabinLower.position.set(0, 0.5, -1.5)
        this.bodyGroup.add(cabinLower)
        
        // CABIN - upper part (slanted roof)
        const cabinUpper = new THREE.Mesh(
            new THREE.BoxGeometry(2.3, 0.8, 1.5),
            this.bodyMaterial
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
            this.bodyMaterial
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
            this.wheels.push({
                group: wheelGroup,
                tire: tire,
                rim: rim,
                baseY: wheelRadius
            })
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
        
        // EXHAUST FLAMES (for turbo boost effect)
        this.exhaustMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 0,
            transparent: true,
            opacity: 0
        })
        
        const exhaustLeft = new THREE.Mesh(
            new THREE.ConeGeometry(0.15, 0.5, 8),
            this.exhaustMaterial
        )
        exhaustLeft.position.set(-0.8, 0.3, 2.2)
        exhaustLeft.rotation.x = Math.PI / 2
        this.bodyGroup.add(exhaustLeft)
        
        const exhaustRight = exhaustLeft.clone()
        exhaustRight.position.set(0.8, 0.3, 2.2)
        this.bodyGroup.add(exhaustRight)
        
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
        this.previousPosition = { x: 0, y: 0, z: 0 }
        
        // Advanced visual effects
        this.tireDeformation = 0           // Tire squash during hard accel/brake
        this.gForceVisual = { x: 0, z: 0 } // Smoothed G-force for visuals
        
        // HUD elements cache
        this.speedElement = document.getElementById('speed')
        this.gearElement = document.getElementById('gear')
        this.turboElement = document.getElementById('turbo')
        this.rpmElement = document.getElementById('rpm')
        
        console.log('Tesla Cybertruck created successfully - Ultra Premium Edition')
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
        
        // ============= UPDATE HUD DISPLAY =============
        if(this.speedElement) {
            const speedKmH = playerState.getSpeedKmH()
            this.speedElement.textContent = speedKmH
            
            // Color change based on speed
            if(speedKmH > 120) {
                this.speedElement.style.color = '#ff0066' // Red at high speed
            } else if(speedKmH > 80) {
                this.speedElement.style.color = '#ffaa00' // Orange at medium-high
            } else {
                this.speedElement.style.color = '#00ffff' // Cyan at normal
            }
        }
        
        if(this.gearElement) {
            const gear = playerState.currentGear || 1
            this.gearElement.textContent = gear === 0 ? 'R' : gear
        }
        
        if(this.turboElement) {
            const turboPercent = ((playerState.turboCharge || 0) * 100).toFixed(0)
            this.turboElement.style.width = turboPercent + '%'
        }
        
        if(this.rpmElement) {
            const rpm = Math.round(playerState.engineRPM || 1000)
            this.rpmElement.textContent = rpm + ' RPM'
        }
        
        // Helper - ultra-advanced car mechanics
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
            
            // Smooth G-force for visual effects
            const rawGForceX = playerState.gForce ? playerState.gForce.x : 0
            const rawGForceZ = playerState.gForce ? playerState.gForce.z : 0
            this.gForceVisual.x += (rawGForceX - this.gForceVisual.x) * 0.15
            this.gForceVisual.z += (rawGForceZ - this.gForceVisual.z) * 0.15
            
            // ============= TURBO BOOST VISUAL EFFECTS =============
            const turboActive = playerState.turboActive || false
            const turboCharge = playerState.turboCharge || 0
            
            if(turboActive && turboCharge > 0.3) {
                // Body glow during turbo
                this.bodyMaterial.emissiveIntensity = 0.3 + turboCharge * 0.4
                this.bodyMaterial.emissive.setHex(0x6666ff + Math.floor(turboCharge * 0x4400))
                
                // Exhaust flames
                this.exhaustMaterial.emissiveIntensity = turboCharge * 3
                this.exhaustMaterial.opacity = turboCharge * 0.8
            } else {
                // Normal state
                this.bodyMaterial.emissiveIntensity = 0.3
                this.bodyMaterial.emissive.setHex(0x666666)
                this.exhaustMaterial.emissiveIntensity *= 0.9
                this.exhaustMaterial.opacity *= 0.9
            }
            
            // ============= WHEEL ROTATION ANIMATION =============
            // Rotate wheels based on speed (realistic rolling)
            const distanceTraveled = speed * time.delta
            const wheelCircumference = Math.PI * 1.0
            this.wheelRotation += (distanceTraveled / wheelCircumference) * Math.PI * 2
            
            // Tire deformation during hard acceleration/braking
            const targetDeformation = Math.abs(acceleration) * 0.008
            this.tireDeformation += (targetDeformation - this.tireDeformation) * 0.2
            
            // Apply rotation and effects to all wheels
            this.wheels.forEach((wheel, index) => {
                // Forward/backward rotation with motion blur effect
                wheel.group.rotation.x = this.wheelRotation
                
                // Speed-based blur (scale wheels slightly to simulate motion blur)
                const blurAmount = 1 + Math.min(0.15, speed / 150)
                wheel.tire.scale.set(1, blurAmount, 1)
                wheel.rim.scale.set(1, blurAmount, 1)
                
                // Tire deformation (squash)
                const isRear = index >= 2
                const deformAmount = isRear ? this.tireDeformation * 1.5 : this.tireDeformation
                wheel.group.position.y = wheel.baseY - deformAmount
                
                // Drift wobble
                if (playerState.isDrifting) {
                    const wobble = Math.sin(this.wheelRotation * 4 + index) * 0.06
                    wheel.group.rotation.z = wobble
                } else {
                    wheel.group.rotation.z *= 0.88
                }
            })
            
            // ============= ADVANCED BODY ROLL (G-Force Based) =============
            // Combine turn rate and lateral G-force for ultra-realistic roll
            const gForceRoll = this.gForceVisual.x * 0.08
            const turnRoll = -rotationDiff * speed * 0.12
            const targetRoll = gForceRoll + turnRoll
            
            this.bodyRoll += (targetRoll - this.bodyRoll) * 0.15
            this.bodyRoll = Math.max(-0.15, Math.min(0.15, this.bodyRoll))
            
            // ============= ADVANCED BODY PITCH (Acceleration G-Force) =============
            const gForcePitch = -this.gForceVisual.z * 0.1
            const accelPitch = -acceleration * 0.018
            const targetPitch = gForcePitch + accelPitch
            
            this.bodyPitch += (targetPitch - this.bodyPitch) * 0.12
            this.bodyPitch = Math.max(-0.12, Math.min(0.10, this.bodyPitch))
            
            // ============= ADVANCED SUSPENSION WITH DAMPING =============
            const verticalAccel = (playerState.position.current[1] - this.previousPosition.y) / (time.delta || 0.016)
            const speedBump = Math.abs(verticalAccel) * 0.025
            const accelBump = Math.abs(acceleration) * 0.012
            const gForceBump = (Math.abs(this.gForceVisual.x) + Math.abs(this.gForceVisual.z)) * 0.02
            
            const targetCompression = speedBump + accelBump + gForceBump
            
            // Spring-damper system
            this.suspensionCompression += (targetCompression - this.suspensionCompression) * 0.25
            this.suspensionCompression = Math.min(0.2, this.suspensionCompression)
            
            // Damping (slower return)
            this.suspensionCompression *= 0.90
            
            // Apply suspension to body
            this.bodyGroup.position.y = -this.suspensionCompression
            
            // ============= DRIFT TILT (Enhanced) =============
            let driftTilt = 0
            if (playerState.isDrifting) {
                driftTilt = playerState.driftAngle * 0.25
                
                // Add tire slip visual feedback
                const tireSlip = playerState.tireSlip || 0
                driftTilt += tireSlip * 0.15
            }
            
            // Calculate target tilt
            const targetTilt = Math.max(-0.08, Math.min(0.08, -rotationDiff * 5)) + driftTilt
            
            // Smoothly interpolate
            this.currentTilt += (targetTilt - this.currentTilt) * 0.15
            
            // Apply combined rotations
            this.helper.rotation.z = this.currentTilt + this.bodyRoll
            this.bodyGroup.rotation.x = this.bodyPitch
            
            // ============= DYNAMIC BRAKE LIGHTS =============
            if (acceleration < -3) {
                this.taillightMaterial.emissiveIntensity = 1.8
                this.taillightMaterial.color.setHex(0xff0000)
            } else {
                this.taillightMaterial.emissiveIntensity = 0.8
                this.taillightMaterial.color.setHex(0xff2222)
            }
            
            // ============= DYNAMIC HEADLIGHTS =============
            const speedRatio = speed / 50
            this.headlightMaterial.emissiveIntensity = 1.2 + speedRatio * 0.8 + turboCharge * 0.5
            
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
