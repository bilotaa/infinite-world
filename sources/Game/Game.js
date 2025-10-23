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

        this.seed = 'p'
        this.debug = new Debug()
        this.state = new State({ username: this.username, carId: this.selectedCar })
        this.view = new View()
        
        window.addEventListener('resize', () =>
        {
            this.resize()
        })

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
        
    }
}