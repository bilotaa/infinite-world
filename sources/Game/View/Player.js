import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

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
        // Load car model from GLB file
        const loader = new GLTFLoader()
        loader.load(
            '/models/sports-car.glb',
            (gltf) => {
                // Get the loaded model
                const model = gltf.scene
                
                // Calculate bounding box for auto-scaling
                const box = new THREE.Box3().setFromObject(model)
                const size = box.getSize(new THREE.Vector3())
                
                // Auto-scale to fit target size (roughly 1.5 units for largest dimension)
                const targetSize = 1.5
                const maxDimension = Math.max(size.x, size.y, size.z)
                const scale = targetSize / maxDimension
                model.scale.set(scale, scale, scale)
                
                // Recalculate bounding box after scaling
                box.setFromObject(model)
                const minY = box.min.y
                
                // Position model so bottom sits on ground
                model.position.y = -minY
                
                // Store reference and add to scene
                this.helper = model
                this.group.add(this.helper)
                
                console.log('Car model loaded successfully')
            },
            (progress) => {
                // Optional: track loading progress
            },
            (error) => {
                console.error('Failed to load car model:', error)
                // Fallback: create a simple box as placeholder
                const fallbackGeometry = new THREE.BoxGeometry(1, 0.8, 2)
                const fallbackMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
                this.helper = new THREE.Mesh(fallbackGeometry, fallbackMaterial)
                this.helper.position.y = 0.4
                this.group.add(this.helper)
            }
        )
    }

    setDebug()
    {
        if(!this.debug.active)
            return

        // Color picker removed since car uses original materials
        // const playerFolder = this.debug.ui.getFolder('view/player')
        // playerFolder.addColor(this.helper.material.uniforms.uColor, 'value')
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
