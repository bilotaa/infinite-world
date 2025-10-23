import * as THREE from 'three'

/**
 * CarPreview - Creates a Three.js scene for a single car 3D preview
 * Handles rendering, lighting, rotation animations, and hover interactions
 */
export default class CarPreview {
    constructor(containerElement, carModel, carName) {
        this.container = containerElement
        this.carModel = carModel
        this.carName = carName

        this.isHovering = false
        this.hoverRotationProgress = 0
        this.idleRotation = 0

        this.setupScene()
        this.setupCamera()
        this.setupLights()
        this.setupRenderer()
        this.addCarToScene()

        this.setupHoverListeners()
        this.animate()
    }

    setupScene() {
        this.scene = new THREE.Scene()
        this.scene.background = null // Transparent background
    }

    setupCamera() {
        // 3/4 view camera (shows front and side)
        const aspect = 1 // Square container
        this.camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 100)
        this.camera.position.set(4, 2.5, 5)
        this.camera.lookAt(0, 0.5, 0)
    }

    setupLights() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        this.scene.add(ambientLight)

        // Main directional light (key light)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(5, 8, 5)
        this.scene.add(directionalLight)

        // Fill light (softer, from opposite side)
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
        fillLight.position.set(-3, 4, -3)
        this.scene.add(fillLight)

        // Rim light (highlights edges)
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.4)
        rimLight.position.set(0, 3, -5)
        this.scene.add(rimLight)
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        })
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.container.appendChild(this.renderer.domElement)
    }

    addCarToScene() {
        this.carGroup = new THREE.Group()
        this.carGroup.add(this.carModel)
        this.scene.add(this.carGroup)
    }

    setupHoverListeners() {
        this.container.addEventListener('mouseenter', () => {
            this.isHovering = true
            this.hoverRotationProgress = 0
        })

        this.container.addEventListener('mouseleave', () => {
            this.isHovering = false
        })
    }

    animate() {
        requestAnimationFrame(() => this.animate())

        if (this.isHovering && this.hoverRotationProgress < Math.PI * 2) {
            // Premium hover animation: 360° rotation over 2.5 seconds
            this.hoverRotationProgress += 0.025
            this.carGroup.rotation.y = this.hoverRotationProgress
        } else if (!this.isHovering) {
            // Slow continuous idle rotation (15 seconds per full rotation)
            this.idleRotation += 0.004
            this.carGroup.rotation.y = this.idleRotation
        }

        this.renderer.render(this.scene, this.camera)
    }

    dispose() {
        // Clean up Three.js resources
        this.renderer.dispose()

        // Dispose geometries and materials
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose()
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose())
                } else {
                    object.material.dispose()
                }
            }
        })

        // Remove canvas from DOM
        if (this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement)
        }
    }
}
