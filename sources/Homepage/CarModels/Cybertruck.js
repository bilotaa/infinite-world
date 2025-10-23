import * as THREE from 'three'

/**
 * Creates a Tesla Cybertruck 3D model using Three.js geometries
 * Simple, performant design with proper colors
 * Returns a Three.js Group containing the complete car model
 */
export function createCybertruckModel() {
    const helper = new THREE.Group()

    // Bright stainless steel material - simple and visible
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e8e8,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x666666,
        emissiveIntensity: 0.4
    })

    // Dark tinted windows
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.3,
        roughness: 0.6,
        emissive: 0x0a0a0a,
        emissiveIntensity: 0.2
    })

    // Black tire material
    const tireMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.1,
        roughness: 0.9
    })

    // Chrome rim material
    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0x444444,
        emissiveIntensity: 0.3
    })

    const bodyGroup = new THREE.Group()
    helper.add(bodyGroup)

    // TRUCK BED (back part)
    const bed = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.2, 3),
        bodyMaterial
    )
    bed.position.set(0, 0.6, 0.5)
    bodyGroup.add(bed)

    // CABIN (front part) - lower
    const cabinLower = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.0, 2),
        bodyMaterial
    )
    cabinLower.position.set(0, 0.5, -1.5)
    bodyGroup.add(cabinLower)

    // CABIN - upper (slanted roof)
    const cabinUpper = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.8, 1.5),
        bodyMaterial
    )
    cabinUpper.position.set(0, 1.3, -1.3)
    cabinUpper.rotation.x = -0.15
    bodyGroup.add(cabinUpper)

    // WINDSHIELD
    const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.7, 0.1),
        windowMaterial
    )
    windshield.position.set(0, 1.2, -2.1)
    windshield.rotation.x = 0.3
    bodyGroup.add(windshield)

    // SIDE WINDOWS
    const windowLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.6, 1.2),
        windowMaterial
    )
    windowLeft.position.set(-1.15, 1.1, -1.3)
    bodyGroup.add(windowLeft)

    const windowRight = windowLeft.clone()
    windowRight.position.set(1.15, 1.1, -1.3)
    bodyGroup.add(windowRight)

    // FRONT HOOD
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.6, 0.8),
        bodyMaterial
    )
    hood.position.set(0, 0.5, -2.8)
    hood.rotation.x = 0.1
    bodyGroup.add(hood)

    // WHEELS - Simple design
    const wheelRadius = 0.5
    const wheelWidth = 0.4
    const wheelPositions = [
        { x: -1.2, z: -1.8 },
        { x: 1.2, z: -1.8 },
        { x: -1.2, z: 1.2 },
        { x: 1.2, z: 1.2 }
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

        // Rim
        const rim = new THREE.Mesh(
            new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth * 0.5, 8),
            rimMaterial
        )
        rim.rotation.z = Math.PI / 2
        wheelGroup.add(rim)

        helper.add(wheelGroup)
    })

    // HEADLIGHTS
    const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffee,
        emissive: 0xffffaa,
        emissiveIntensity: 1.5
    })

    const headlightLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.1, 0.1),
        headlightMaterial
    )
    headlightLeft.position.set(-0.8, 0.6, -3.1)
    bodyGroup.add(headlightLeft)

    const headlightRight = headlightLeft.clone()
    headlightRight.position.set(0.8, 0.6, -3.1)
    bodyGroup.add(headlightRight)

    // TAILLIGHTS
    const taillightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff2222,
        emissive: 0xff0000,
        emissiveIntensity: 1.0
    })

    const taillightLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.15, 0.1),
        taillightMaterial
    )
    taillightLeft.position.set(-1.0, 0.9, 2.0)
    bodyGroup.add(taillightLeft)

    const taillightRight = taillightLeft.clone()
    taillightRight.position.set(1.0, 0.9, 2.0)
    bodyGroup.add(taillightRight)

    // Position entire truck
    helper.position.y = 0.2

    return helper
}
