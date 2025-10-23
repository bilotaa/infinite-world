import * as THREE from 'three'

/**
 * Creates a Toyota Supra MK4 3D model using Three.js geometries
 * Distinctive features: Low profile, long hood, rounded rear spoiler
 * Returns a Three.js Group containing the complete car model
 */
export function createSupraMK4Model() {
    const helper = new THREE.Group()

    // Orange body material (iconic Supra orange)
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xff8800, // Bright orange
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x442200,
        emissiveIntensity: 0.2
    })

    // Dark tinted windows
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.4,
        roughness: 0.5,
        emissive: 0x050505,
        emissiveIntensity: 0.1
    })

    // Black tire material
    const tireMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.2,
        roughness: 0.9,
        emissive: 0x0a0a0a,
        emissiveIntensity: 0.1
    })

    // Chrome wheel rim material
    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0x555555,
        emissiveIntensity: 0.25
    })

    // Create body container
    const bodyGroup = new THREE.Group()
    helper.add(bodyGroup)

    // LONG HOOD (distinctive Supra feature)
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.5, 2.5),
        bodyMaterial
    )
    hood.position.set(0, 0.45, -1.8)
    hood.rotation.x = -0.08 // Slight downward slope
    bodyGroup.add(hood)

    // FRONT BUMPER
    const frontBumper = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.35, 0.4),
        bodyMaterial
    )
    frontBumper.position.set(0, 0.25, -3.0)
    bodyGroup.add(frontBumper)

    // MAIN CABIN (lower and sleeker than Cybertruck)
    const cabinLower = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.8, 2.2),
        bodyMaterial
    )
    cabinLower.position.set(0, 0.6, 0.2)
    bodyGroup.add(cabinLower)

    // CABIN ROOF (rounded, low profile)
    const cabinRoof = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.6, 1.8),
        bodyMaterial
    )
    cabinRoof.position.set(0, 1.2, 0.1)
    cabinRoof.rotation.x = -0.05
    bodyGroup.add(cabinRoof)

    // WINDSHIELD (slanted)
    const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.55, 0.08),
        windowMaterial
    )
    windshield.position.set(0, 1.1, -0.7)
    windshield.rotation.x = 0.35
    bodyGroup.add(windshield)

    // SIDE WINDOWS
    const windowLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.45, 1.5),
        windowMaterial
    )
    windowLeft.position.set(-1.05, 1.05, 0.2)
    bodyGroup.add(windowLeft)

    const windowRight = windowLeft.clone()
    windowRight.position.set(1.05, 1.05, 0.2)
    bodyGroup.add(windowRight)

    // REAR WINDOW
    const rearWindow = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.4, 0.08),
        windowMaterial
    )
    rearWindow.position.set(0, 1.0, 1.0)
    rearWindow.rotation.x = -0.25
    bodyGroup.add(rearWindow)

    // TRUNK/REAR SECTION
    const trunk = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.6, 1.0),
        bodyMaterial
    )
    trunk.position.set(0, 0.5, 1.5)
    bodyGroup.add(trunk)

    // ICONIC REAR SPOILER (distinctive Supra feature)
    const spoilerMount = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.4, 0.15),
        bodyMaterial
    )
    spoilerMount.position.set(0, 1.0, 2.0)
    bodyGroup.add(spoilerMount)

    const spoilerWing = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.08, 0.4),
        bodyMaterial
    )
    spoilerWing.position.set(0, 1.3, 2.0)
    bodyGroup.add(spoilerWing)

    // WHEELS - 4 wheels positioned for sports car stance
    const wheelRadius = 0.45
    const wheelWidth = 0.35
    const wheelPositions = [
        { x: -1.15, z: -1.6 },  // Front left
        { x: 1.15, z: -1.6 },   // Front right
        { x: -1.15, z: 1.3 },   // Rear left
        { x: 1.15, z: 1.3 }     // Rear right
    ]

    wheelPositions.forEach(pos => {
        const wheelGroup = new THREE.Group()
        wheelGroup.position.set(pos.x, wheelRadius, pos.z)

        // Tire
        const tire = new THREE.Mesh(
            new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16),
            tireMaterial
        )
        tire.rotation.z = Math.PI / 2
        wheelGroup.add(tire)

        // Chrome rim
        const rim = new THREE.Mesh(
            new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, wheelWidth * 0.5, 10),
            rimMaterial
        )
        rim.rotation.z = Math.PI / 2
        wheelGroup.add(rim)

        helper.add(wheelGroup)
    })

    // HEADLIGHTS (round, iconic Supra headlights)
    const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffdd,
        emissive: 0xffffbb,
        emissiveIntensity: 1.0
    })

    const headlightLeft = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 12),
        headlightMaterial
    )
    headlightLeft.position.set(-0.85, 0.45, -2.95)
    headlightLeft.scale.set(1, 1, 0.5)
    bodyGroup.add(headlightLeft)

    const headlightRight = headlightLeft.clone()
    headlightRight.position.set(0.85, 0.45, -2.95)
    bodyGroup.add(headlightRight)

    // TAILLIGHTS (distinctive round Supra taillights)
    const taillightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff1111,
        emissive: 0xff0000,
        emissiveIntensity: 0.9
    })

    const taillightLeft = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 10),
        taillightMaterial
    )
    taillightLeft.position.set(-0.9, 0.65, 1.98)
    taillightLeft.scale.set(1, 1, 0.4)
    bodyGroup.add(taillightLeft)

    const taillightRight = taillightLeft.clone()
    taillightRight.position.set(0.9, 0.65, 1.98)
    bodyGroup.add(taillightRight)

    // Position entire car (lower stance than Cybertruck)
    helper.position.y = 0.15

    return helper
}
