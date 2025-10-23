import Game from '@/Game.js'
import Homepage from './Homepage/Homepage.js'

// Initialize homepage first
const homepage = new Homepage()

// Setup game start handler
homepage.onStart((username, carId) => {
    // Initialize game with player data
    const game = new Game({ username, carId })

    if(game.view)
        document.querySelector('.game').append(game.view.renderer.instance.domElement)
})