import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createCybertruckModel } from './CarModels/Cybertruck.js'
import { createSupraMK4Model } from './CarModels/SupraMK4.js'
import { createLamborghiniModel } from './CarModels/Lamborghini.js'

/**
 * ModelLoader - Centralized model loading service with GLTFLoader and caching
 * Singleton pattern to ensure single instance across the application
 *
 * Usage:
 *   const modelLoader = ModelLoader.getInstance()
 *   await modelLoader.preloadAllModels((percentage, currentItem) => {
 *     console.log(`${percentage}% - ${currentItem}`)
 *   })
 *   const model = modelLoader.getModel('supra')
 */
export default class ModelLoader {
    static instance = null

    /**
     * Get singleton instance of ModelLoader
     * @returns {ModelLoader}
     */
    static getInstance() {
        if (!ModelLoader.instance) {
            ModelLoader.instance = new ModelLoader()
        }
        return ModelLoader.instance
    }

    constructor() {
        // Cache for loaded models
        this.cache = new Map()

        // GLTFLoader instance for loading GLB files
        this.loader = new GLTFLoader()
    }

    /**
     * Preload all car models before showing homepage
     * @param {Function} onProgress - Callback function (percentage, currentItem) => void
     * @returns {Promise<void>}
     */
    async preloadAllModels(onProgress) {
        try {
            // Load Cybertruck (procedural)
            onProgress(0, 'Loading Cybertruck...')
            const cybertruckModel = createCybertruckModel()
            this.cache.set('cybertruck', cybertruckModel)
            onProgress(33, 'Cybertruck loaded')

            // Load Supra (GLB)
            onProgress(33, 'Loading Supra MK4 model...')
            try {
                const supraModel = await this.loadGLB('/models/supra-mk4.glb')
                this.cache.set('supra', supraModel)
            } catch (error) {
                console.error('Failed to load Supra GLB:', error)
                console.log('Using fallback procedural Supra model')
                const supraFallback = createSupraMK4Model()
                this.cache.set('supra', supraFallback)
            }
            onProgress(66, 'Supra loaded')

            // Load Lamborghini (procedural)
            onProgress(66, 'Loading Lamborghini...')
            const lamborghiniModel = createLamborghiniModel()
            this.cache.set('lamborghini', lamborghiniModel)
            onProgress(100, 'All models loaded')

        } catch (error) {
            console.error('Error during model preloading:', error)
            throw error
        }
    }

    /**
     * Load a GLB file using GLTFLoader
     * @param {string} path - Path to GLB file (e.g., '/models/supra-mk4.glb')
     * @returns {Promise<THREE.Group>}
     */
    loadGLB(path) {
        return new Promise((resolve, reject) => {
            console.log(`[ModelLoader] Starting to load: ${path}`)
            
            this.loader.load(
                path,
                (gltf) => {
                    console.log(`[ModelLoader] GLB loaded successfully:`, gltf)
                    
                    // Extract the scene from the loaded GLTF
                    const model = gltf.scene
                    
                    // Log model structure
                    console.log(`[ModelLoader] Model children count: ${model.children.length}`)
                    console.log(`[ModelLoader] Model structure:`, model)
                    
                    // Calculate bounding box to determine size
                    const box = new THREE.Box3().setFromObject(model)
                    const size = new THREE.Vector3()
                    box.getSize(size)
                    
                    console.log(`[ModelLoader] Original model size:`, {
                        x: size.x.toFixed(2),
                        y: size.y.toFixed(2),
                        z: size.z.toFixed(2)
                    })
                    
                    // Target size (approximate procedural car size)
                    // Procedural Supra is about 4 units long, 1.5 units tall
                    const targetLength = 4.0
                    const currentLength = Math.max(size.x, size.z)
                    
                    if (currentLength > 0) {
                        const scale = targetLength / currentLength
                        model.scale.set(scale, scale, scale)
                        console.log(`[ModelLoader] Applied scale: ${scale.toFixed(3)}`)
                    }
                    
                    // Center the model and position it properly
                    box.setFromObject(model) // Recalculate after scaling
                    const center = new THREE.Vector3()
                    box.getCenter(center)
                    
                    // Move model so bottom is at y=0 and centered on x/z
                    model.position.x = -center.x
                    model.position.y = -box.min.y // Bottom touches ground
                    model.position.z = -center.z
                    
                    console.log(`[ModelLoader] Model positioned at:`, {
                        x: model.position.x.toFixed(2),
                        y: model.position.y.toFixed(2),
                        z: model.position.z.toFixed(2)
                    })
                    
                    // Configure model properties
                    let meshCount = 0
                    model.traverse((child) => {
                        if (child.isMesh) {
                            meshCount++
                            child.castShadow = true
                            child.receiveShadow = true
                            
                            // Ensure materials are visible
                            if (child.material) {
                                child.material.needsUpdate = true
                            }
                        }
                    })
                    
                    console.log(`[ModelLoader] Configured ${meshCount} meshes`)
                    console.log(`[ModelLoader] Model ready for use`)

                    resolve(model)
                },
                (progress) => {
                    // Progress callback
                    if (progress.lengthComputable) {
                        const percentComplete = (progress.loaded / progress.total) * 100
                        console.log(`[ModelLoader] Loading GLB: ${percentComplete.toFixed(1)}% (${progress.loaded}/${progress.total} bytes)`)
                    } else {
                        console.log(`[ModelLoader] Loading GLB: ${progress.loaded} bytes loaded`)
                    }
                },
                (error) => {
                    console.error(`[ModelLoader] Failed to load GLB from ${path}:`, error)
                    console.error(`[ModelLoader] Error details:`, {
                        message: error.message,
                        stack: error.stack,
                        type: error.type || 'unknown'
                    })
                    reject(error)
                }
            )
        })
    }

    /**
     * Retrieve cached model and return a clone
     * @param {string} carId - Car identifier ('supra', 'cybertruck', 'lamborghini')
     * @returns {THREE.Group} - Cloned model from cache
     */
    getModel(carId) {
        if (!this.cache.has(carId)) {
            throw new Error(`Model '${carId}' not preloaded. Call preloadAllModels() first.`)
        }

        // Return a clone so each usage gets a separate instance
        return this.cache.get(carId).clone()
    }
}
