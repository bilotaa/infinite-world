import CarPreview from './CarPreview.js'
import LoadingScreen from './LoadingScreen.js'
import ModelLoader from './ModelLoader.js'

/**
 * Homepage - Main controller for the game homepage overlay
 * Manages user input, car selection, validation, and game start
 */
export default class Homepage {
    constructor() {
        this.selectedCarId = 'cybertruck' // Default selection
        this.username = ''
        this.onStartCallback = null

        this.cars = [
            { id: 'cybertruck', name: 'Cybertruck' },
            { id: 'supra', name: 'Supra MK4' },
            { id: 'lamborghini', name: 'Lamborghini' }
        ]

        this.carPreviews = []

        // Show loading screen and preload models before initializing
        this.loadingScreen = new LoadingScreen()
        this.loadingScreen.show()

        // Start preloading process
        this.preloadAndInit()
    }

    async preloadAndInit() {
        const modelLoader = ModelLoader.getInstance()
        
        try {
            // Preload all models with progress updates
            await modelLoader.preloadAllModels((percentage, currentItem) => {
                this.loadingScreen.updateProgress(percentage, currentItem)
            })
            
            // Models loaded successfully
            this.loadingScreen.hide()
            
            // Wait for fade out (0.5s), then show homepage and initialize
            setTimeout(() => {
                // Show homepage overlay
                document.querySelector('.homepage-overlay').style.display = 'flex'
                
                // Initialize homepage interactivity
                this.init()
            }, 500)
            
        } catch (error) {
            console.error('Model loading failed:', error)
            // Still proceed with fallback models
            this.loadingScreen.hide()
            setTimeout(() => {
                document.querySelector('.homepage-overlay').style.display = 'flex'
                this.init()
            }, 500)
        }
    }

    init() {
        this.cacheElements()
        this.setupCarPreviews()
        this.setupEventListeners()
        this.updateButtonState()

        // Select first car by default
        this.selectCar('cybertruck')
    }

    cacheElements() {
        this.overlay = document.querySelector('.homepage-overlay')
        this.usernameInput = document.getElementById('username-input')
        this.usernameError = document.getElementById('username-error')
        this.startButton = document.getElementById('start-game-btn')

        this.carContainers = [
            document.getElementById('car-preview-1'),
            document.getElementById('car-preview-2'),
            document.getElementById('car-preview-3')
        ]
    }

    setupCarPreviews() {
        const modelLoader = ModelLoader.getInstance()
        
        this.cars.forEach((car, index) => {
            const container = this.carContainers[index]
            const carModel = modelLoader.getModel(car.id)
            const preview = new CarPreview(container, carModel, car.name)

            this.carPreviews.push(preview)

            // Add car selection click handler
            container.addEventListener('click', () => this.selectCar(car.id))

            // Store car ID on container for reference
            container.dataset.carId = car.id

            // Add car name label
            const label = document.createElement('div')
            label.className = 'car-name-label'
            label.textContent = car.name
            container.appendChild(label)
        })
    }

    setupEventListeners() {
        // Real-time username validation
        this.usernameInput.addEventListener('input', () => {
            this.validateUsername()
            this.updateButtonState()
        })

        // Enter key in input triggers game start
        this.usernameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.isUsernameValid()) {
                this.startGame()
            }
        })

        // Start button click
        this.startButton.addEventListener('click', () => {
            if (this.isUsernameValid()) {
                this.startGame()
            }
        })
    }

    selectCar(carId) {
        this.selectedCarId = carId

        // Update visual selection state
        this.carContainers.forEach(container => {
            if (container.dataset.carId === carId) {
                container.classList.add('selected')
            } else {
                container.classList.remove('selected')
            }
        })
    }

    validateUsername() {
        const rawValue = this.usernameInput.value
        const trimmedValue = rawValue.trim()

        // Clear previous error
        this.usernameError.textContent = ''
        this.usernameError.classList.remove('visible')

        // No validation during typing - only on button click
        // This just updates the internal username value
        this.username = trimmedValue

        return this.isUsernameValid()
    }

    isUsernameValid() {
        const trimmed = this.usernameInput.value.trim()
        return trimmed.length >= 2 && trimmed.length <= 20
    }

    updateButtonState() {
        if (this.isUsernameValid()) {
            this.startButton.disabled = false
        } else {
            this.startButton.disabled = true
        }
    }

    startGame() {
        // Prevent double-execution
        if (this.isStarting) return
        this.isStarting = true

        // Final validation
        if (!this.isUsernameValid()) {
            this.usernameError.textContent = 'Username must be 2-20 characters'
            this.usernameError.classList.add('visible')
            this.isStarting = false
            return
        }

        // Disable button during transition
        this.startButton.disabled = true

        // Get trimmed username
        const finalUsername = this.usernameInput.value.trim()

        // Trigger fade out transition
        this.overlay.classList.add('fade-out')

        // Wait for fade animation to complete (1s)
        setTimeout(() => {
            // Hide overlay completely
            this.overlay.style.display = 'none'

            // Show and activate game container
            const gameContainer = document.querySelector('.game')
            gameContainer.style.display = 'block'
            gameContainer.classList.add('active')

            // Dispose of Three.js resources
            this.carPreviews.forEach(preview => preview.dispose())

            // Call the game start callback with player data
            if (this.onStartCallback) {
                this.onStartCallback(finalUsername, this.selectedCarId)
            }
        }, 1000)
    }

    /**
     * Register callback for when "Start Game" is clicked
     * @param {Function} callback - Called with (username, carId) parameters
     */
    onStart(callback) {
        this.onStartCallback = callback
    }
}
