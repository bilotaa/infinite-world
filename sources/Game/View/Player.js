import * as THREE from 'three'

import Game from '@/Game.js'
import View from '@/View/View.js'
import Debug from '@/Debug/Debug.js'
import State from '@/State/State.js'

import ModelLoader from '../../Homepage/ModelLoader.js'

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
        // Get selected car from player state
        const carId = this.state.player.selectedCar

        // Get model from cache (already preloaded)
        const modelLoader = ModelLoader.getInstance()
        this.helper = modelLoader.getModel(carId)

        // Store reference to body materials for animations
        // Find body material from the car model
        this.bodyMaterial = null
        this.bodyGroup = null
        this.helper.traverse((child) => {
            if (child.isMesh && child.material && child.material.metalness > 0.5) {
                if (!this.bodyMaterial) {
                    this.bodyMaterial = child.material
                }
            }
            if (child.isGroup && child.children.length > 5) {
                this.bodyGroup = child
            }
        })

        // If bodyGroup not found, create one
        if (!this.bodyGroup) {
            this.bodyGroup = new THREE.Group()
            // Move all existing children to bodyGroup
            const children = [...this.helper.children]
            children.forEach(child => {
                this.helper.remove(child)
                this.bodyGroup.add(child)
            })
            this.helper.add(this.bodyGroup)
        }

        // Store wheel references for animation
        this.wheels = []
        
        // Find existing wheels in the model
        this.helper.traverse((child) => {
            if (child.isGroup && child.children.length === 2) {
                // Likely a wheel group (has tire and rim)
                const hasCylinder = child.children.some(c => c.geometry && c.geometry.type === 'CylinderGeometry')
                if (hasCylinder) {
                    this.wheels.push({
                        group: child,
                        tire: child.children[0],
                        rim: child.children[1],
                        baseY: child.position.y
                    })
                }
            }
        })

        // HEADLIGHTS - find or create
        this.headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffee,
            emissive: 0xffffaa,
            emissiveIntensity: 1.2
        })

        // TAILLIGHTS - find or create
        this.taillightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff2222,
            emissive: 0xff0000,
            emissiveIntensity: 0.8
        })

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

        // Add helper to group
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
        
        console.log(`Car model loaded: ${carId}`)
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
