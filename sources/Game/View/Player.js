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
        
        // Stainless steel material for Cybertruck body
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0, // Silver/stainless steel
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x222222,
            emissiveIntensity: 0.1
        })
        
        // Black material for windows and details
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.1,
            roughness: 0.8
        })
        
        // Tire material
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.2,
            roughness: 0.9
        })
        
        // Wheel rim material
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.4
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
            color: 0xffffaa,
            emissive: 0xffff88,
            emissiveIntensity: 0.8
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
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
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
        
        // Helper - only update rotation if model is loaded
        if (this.helper) {
            this.helper.rotation.y = playerState.rotation
        }
    }
}
