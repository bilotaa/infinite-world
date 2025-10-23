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
            this.loader.load(
                path,
                (gltf) => {
                    // Extract the scene from the loaded GLTF
                    const model = gltf.scene

                    // Configure model properties
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true
                            child.receiveShadow = true
                        }
                    })

                    resolve(model)
                },
                (progress) => {
                    // Progress callback (optional)
                    if (progress.lengthComputable) {
                        const percentComplete = (progress.loaded / progress.total) * 100
                        console.log(`Loading GLB: ${percentComplete.toFixed(1)}%`)
                    }
                },
                (error) => {
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
