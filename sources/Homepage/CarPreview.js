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
        this.time = 0

        this.setupScene()
        this.setupCamera()
        this.setupLights()
        this.setupGround()
        this.setupRenderer()
        this.addCarToScene()

        this.setupHoverListeners()
        this.animate()
    }

    setupScene() {
        this.scene = new THREE.Scene()
        
        // Dark atmospheric fog for depth
        this.scene.fog = new THREE.Fog(0x0a0a0f, 8, 20)
        
        // Very dark background
        this.scene.background = new THREE.Color(0x0a0a0f)
    }

    setupCamera() {
        // Dramatic 3/4 showroom angle
        const aspect = 1 // Square container
        this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100)
        this.camera.position.set(5, 2.8, 6)
        this.camera.lookAt(0, 0.8, 0)
    }

    setupLights() {
        // Ambient base light (very dim)
        const ambientLight = new THREE.AmbientLight(0x404060, 0.3)
        this.scene.add(ambientLight)

        // Key light (main spotlight from top-front) - cool white
        const keyLight = new THREE.SpotLight(0xffffff, 1.5)
        keyLight.position.set(4, 8, 4)
        keyLight.angle = Math.PI / 6
        keyLight.penumbra = 0.3
        keyLight.decay = 2
        keyLight.distance = 30
        keyLight.target.position.set(0, 0, 0)
        this.scene.add(keyLight)
        this.scene.add(keyLight.target)

        // Rim light (back-top) - cool cyan
        const rimLight = new THREE.SpotLight(0x00ddff, 1.2)
        rimLight.position.set(-3, 6, -4)
        rimLight.angle = Math.PI / 5
        rimLight.penumbra = 0.4
        rimLight.decay = 2
        rimLight.distance = 25
        rimLight.target.position.set(0, 0, 0)
        this.scene.add(rimLight)
        this.scene.add(rimLight.target)

        // Fill light (side) - warm orange
        const fillLight = new THREE.PointLight(0xff8844, 0.6, 20)
        fillLight.position.set(6, 2, 2)
        this.scene.add(fillLight)

        // Ground reflection light (from below)
        const groundLight = new THREE.PointLight(0x4466ff, 0.4, 15)
        groundLight.position.set(0, -1, 0)
        this.scene.add(groundLight)

        // Accent lights (animated)
        this.accentLight1 = new THREE.PointLight(0xff00ff, 0.5, 10)
        this.accentLight1.position.set(-4, 1, 3)
        this.scene.add(this.accentLight1)

        this.accentLight2 = new THREE.PointLight(0x00ffff, 0.5, 10)
        this.accentLight2.position.set(4, 1, -3)
        this.scene.add(this.accentLight2)
    }

    setupGround() {
        // Reflective ground platform
        const groundGeometry = new THREE.CircleGeometry(4, 32)
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x0a0a1a,
            emissiveIntensity: 0.2
        })
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.position.y = 0
        ground.receiveShadow = true
        this.scene.add(ground)

        // Glowing grid lines on ground
        const gridHelper = new THREE.PolarGridHelper(4, 12, 8, 64, 0x00ffff, 0x004466)
        gridHelper.position.y = 0.01
        this.scene.add(gridHelper)

        // Subtle glow ring under car
        const ringGeometry = new THREE.RingGeometry(1.5, 1.8, 32)
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        })
        this.glowRing = new THREE.Mesh(ringGeometry, ringMaterial)
        this.glowRing.rotation.x = -Math.PI / 2
        this.glowRing.position.y = 0.02
        this.scene.add(this.glowRing)
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        })
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1.2
        this.container.appendChild(this.renderer.domElement)
    }

    addCarToScene() {
        this.carGroup = new THREE.Group()
        this.carGroup.add(this.carModel)
        
        // Enable shadows on car
        this.carModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        
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

        this.time += 0.016

        // Animate accent lights (subtle movement)
        this.accentLight1.intensity = 0.5 + Math.sin(this.time * 2) * 0.2
        this.accentLight2.intensity = 0.5 + Math.cos(this.time * 2) * 0.2

        // Pulse glow ring
        if (this.glowRing) {
            this.glowRing.material.opacity = 0.2 + Math.sin(this.time * 1.5) * 0.1
        }

        // Car rotation
        if (this.isHovering && this.hoverRotationProgress < Math.PI * 2) {
            // Smooth 360° rotation on hover (2.5 seconds)
            this.hoverRotationProgress += 0.025
            this.carGroup.rotation.y = this.hoverRotationProgress
        } else if (!this.isHovering) {
            // Slow continuous idle rotation (12 seconds per rotation)
            this.idleRotation += 0.005
            this.carGroup.rotation.y = this.idleRotation
        }

        // Subtle up-down float animation
        this.carGroup.position.y = Math.sin(this.time * 0.8) * 0.08

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
