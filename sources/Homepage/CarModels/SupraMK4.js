import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Loads the 1994 Toyota Supra MK4 Bomex (Fast & Furious) 3D model
 * Returns a Promise that resolves with the Three.js Group containing the car model
 */
export async function createSupraMK4Model() {
    const loader = new GLTFLoader()
    
    return new Promise((resolve, reject) => {
        loader.load(
            '/models/1994_toyota_supra_mk_iv_bomex_fast__furious.glb',
            (gltf) => {
                const model = gltf.scene
                
                // Scale and position adjustments for the Supra model
                model.scale.set(1, 1, 1) // Adjust as needed when file is added
                model.position.set(0, 0, 0)
                model.rotation.y = 0
                
                // Enable shadows on all meshes
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true
                        child.receiveShadow = true
                        
                        // Enhance materials for better lighting
                        if (child.material) {
                            child.material.needsUpdate = true
                        }
                    }
                })
                
                resolve(model)
            },
            (progress) => {
                // Loading progress (optional)
                const percent = (progress.loaded / progress.total) * 100
                console.log(`Loading Supra model: ${percent.toFixed(2)}%`)
            },
            (error) => {
                console.error('Error loading Supra model:', error)
                // Fallback: create a simple placeholder if model fails to load
                const placeholder = new THREE.Group()
                const geometry = new THREE.BoxGeometry(2, 0.8, 4)
                const material = new THREE.MeshStandardMaterial({ color: 0xff8800 })
                const mesh = new THREE.Mesh(geometry, material)
                placeholder.add(mesh)
                resolve(placeholder)
            }
        )
    })
}
