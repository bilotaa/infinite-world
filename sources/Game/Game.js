import Debug from '@/Debug/Debug.js'
import State from '@/State/State.js'
import View from '@/View/View.js'

export default class Game
{
    static instance

    static getInstance()
    {
        return Game.instance
    }

    constructor(options = {})
    {
        if(Game.instance)
            return Game.instance

        Game.instance = this

        // Store player data from homepage
        this.username = options.username || 'Player'
        this.selectedCar = options.carId || 'cybertruck'

        // Create game DOM element for renderer attachment
        this.domElement = document.querySelector('.game') || document.body

        this.seed = 'p'
        this.debug = new Debug()
        this.state = new State({ username: this.username, carId: this.selectedCar })
        this.view = new View()
        
        // Store resize handler for cleanup
        this.resizeHandler = () =>
        {
            this.resize()
        }
        window.addEventListener('resize', this.resizeHandler)

        this.update()
    }

    update()
    {
        this.state.update()
        this.view.update()

        window.requestAnimationFrame(() =>
        {
            this.update()
        })
    }

    resize()
    {
        this.state.resize()
        this.view.resize()
    }

    destroy()
    {
        // Clean up event listeners to prevent memory leaks
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler)
        }
        
        // Clean up state and view
        if (this.state && this.state.destroy) {
            this.state.destroy()
        }
        if (this.view && this.view.destroy) {
            this.view.destroy()
        }
    }
}