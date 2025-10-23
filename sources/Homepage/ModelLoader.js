import * as THREE from 'three'
import { createCybertruckModel } from './CarModels/Cybertruck.js'
import { createSupraMK4Model } from './CarModels/SupraMK4.js'
import { createLamborghiniModel } from './CarModels/Lamborghini.js'

/**
 * ModelLoader - Centralized model loading service with caching
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

            // Load Supra (procedural)
            onProgress(33, 'Loading Supra MK4...')
            const supraModel = createSupraMK4Model()
            this.cache.set('supra', supraModel)
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
