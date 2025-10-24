import Camera from './Camera.js'
import Chunks from './Chunks.js'
import Grass from './Grass.js'
import Noises from './Noises.js'
import Player from './Player.js'
import Renderer from './Renderer.js'
import Sky from './Sky.js'
import Terrains from './Terrains.js'
import Trees from './Trees.js'
import Water from './Water.js'

import * as THREE from 'three'

export default class View
{
    static instance

    static getInstance()
    {
        return View.instance
    }

    constructor()
    {
        if(View.instance)
            return View.instance

        View.instance = this

        this.scene = new THREE.Scene()
        
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.noises = new Noises()
        this.sky = new Sky()
        this.water = new Water()
        this.terrains = new Terrains()
        this.trees = new Trees()
        this.chunks = new Chunks()
        this.player = new Player()
        this.grass = new Grass()
    }

    resize()
    {
        this.camera.resize()
        this.renderer.resize()
        this.sky.resize()
        this.terrains.resize()
    }

    update()
    {
        this.sky.update()
        this.water.update()
        this.terrains.update()
        this.trees.update()
        this.chunks.update()
        this.player.update()
        this.grass.update()
        this.camera.update()
        this.renderer.update()
    }

    destroy()
    {
        // Clean up all view components to free memory
        if (this.renderer) this.renderer.destroy()
        if (this.grass && this.grass.destroy) this.grass.destroy()
        if (this.player && this.player.destroy) this.player.destroy()
        if (this.trees && this.trees.destroy) this.trees.destroy()
        if (this.chunks && this.chunks.destroy) this.chunks.destroy()
        if (this.terrains && this.terrains.destroy) this.terrains.destroy()
        if (this.water && this.water.destroy) this.water.destroy()
        if (this.sky && this.sky.destroy) this.sky.destroy()
        if (this.noises && this.noises.destroy) this.noises.destroy()
        
        // Clear scene
        if (this.scene) {
            while(this.scene.children.length > 0) {
                this.scene.remove(this.scene.children[0])
            }
        }
    }
}