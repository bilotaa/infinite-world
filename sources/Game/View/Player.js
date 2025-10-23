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
        
        // TRUCK BED (back part)
        const bed = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 1.2, 3),
            bodyMaterial
        )
        bed.position.set(0, 0.6, 0.5)
        this.helper.add(bed)
        
        // CABIN (front part) - lower part
        const cabinLower = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 1.0, 2),
            bodyMaterial
        )
        cabinLower.position.set(0, 0.5, -1.5)
        this.helper.add(cabinLower)
        
        // CABIN - upper part (slanted roof)
        const cabinUpper = new THREE.Mesh(
            new THREE.BoxGeometry(2.3, 0.8, 1.5),
            bodyMaterial
        )
        cabinUpper.position.set(0, 1.3, -1.3)
        cabinUpper.rotation.x = -0.15 // Slight angle for Cybertruck look
        this.helper.add(cabinUpper)
        
        // WINDSHIELD (angular, dark)
        const windshield = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.7, 0.1),
            windowMaterial
        )
        windshield.position.set(0, 1.2, -2.1)
        windshield.rotation.x = 0.3
        this.helper.add(windshield)
        
        // SIDE WINDOWS
        const windowLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.6, 1.2),
            windowMaterial
        )
        windowLeft.position.set(-1.15, 1.1, -1.3)
        this.helper.add(windowLeft)
        
        const windowRight = windowLeft.clone()
        windowRight.position.set(1.15, 1.1, -1.3)
        this.helper.add(windowRight)
        
        // FRONT HOOD/NOSE
        const hood = new THREE.Mesh(
            new THREE.BoxGeometry(2.3, 0.6, 0.8),
            bodyMaterial
        )
        hood.position.set(0, 0.5, -2.8)
        hood.rotation.x = 0.1
        this.helper.add(hood)
        
        // WHEELS - Create 4 wheels
        const wheelRadius = 0.5
        const wheelWidth = 0.4
        const wheelPositions = [
            { x: -1.2, z: -1.8 }, // Front left
            { x: 1.2, z: -1.8 },  // Front right
            { x: -1.2, z: 1.2 },  // Back left
            { x: 1.2, z: 1.2 }    // Back right
        ]
        
        wheelPositions.forEach(pos => {
            // Tire (black cylinder)
            const tire = new THREE.Mesh(
                new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16),
                tireMaterial
            )
            tire.rotation.z = Math.PI / 2
            tire.position.set(pos.x, wheelRadius, pos.z)
            this.helper.add(tire)
            
            // Rim (metallic center)
            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth * 0.6, 8),
                rimMaterial
            )
            rim.rotation.z = Math.PI / 2
            rim.position.set(pos.x, wheelRadius, pos.z)
            this.helper.add(rim)
        })
        
        // HEADLIGHTS (glowing strips for Cybertruck look)
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffee,
            emissive: 0xffffaa,
            emissiveIntensity: 1.2
        })
        
        const headlightLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.1, 0.1),
            headlightMaterial
        )
        headlightLeft.position.set(-0.8, 0.6, -3.1)
        this.helper.add(headlightLeft)
        
        const headlightRight = headlightLeft.clone()
        headlightRight.position.set(0.8, 0.6, -3.1)
        this.helper.add(headlightRight)
        
        // TAILLIGHTS (red strips)
        const taillightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff2222,
            emissive: 0xff0000,
            emissiveIntensity: 0.8
        })
        
        const taillightLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.15, 0.1),
            taillightMaterial
        )
        taillightLeft.position.set(-1.0, 0.9, 2.0)
        this.helper.add(taillightLeft)
        
        const taillightRight = taillightLeft.clone()
        taillightRight.position.set(1.0, 0.9, 2.0)
        this.helper.add(taillightRight)
        
        // Position entire truck above ground
        this.helper.position.y = 0.2
        
        // Add truck to group
        this.group.add(this.helper)
        
        // Store previous rotation for tilt animation
        this.previousRotation = 0
        
        console.log('Tesla Cybertruck created successfully')
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

        this.group.position.set(
            playerState.position.current[0],
            playerState.position.current[1],
            playerState.position.current[2]
        )
        
        // Helper - update rotation with tilt effect for driving feel
        if (this.helper) {
            // Calculate rotation difference for tilt effect
            const rotationDiff = playerState.rotation - this.previousRotation
            
            // Apply main rotation
            this.helper.rotation.y = playerState.rotation
            
            // Add subtle tilt when turning (lean into turns like a real vehicle)
            const tiltAmount = Math.max(-0.08, Math.min(0.08, rotationDiff * 2))
            this.helper.rotation.z = -tiltAmount
            
            // Store current rotation for next frame
            this.previousRotation = playerState.rotation
        }
    }
}
