import * as THREE from 'three'

/**
 * Creates a Lamborghini 3D model using Three.js geometries
 * Simple, performant design with proper colors
 * Distinctive features: Very low wedge shape, angular body, aggressive stance
 * Returns a Three.js Group containing the complete car model
 */
export function createLamborghiniModel() {
    const helper = new THREE.Group()

    // Bright lime green material - iconic Lamborghini color
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaff00,
        metalness: 0.8,
        roughness: 0.25,
        emissive: 0x335500,
        emissiveIntensity: 0.35
    })

    // Dark tinted windows
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        metalness: 0.4,
        roughness: 0.4,
        emissive: 0x020202,
        emissiveIntensity: 0.2
    })

    // Black tire material
    const tireMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.2,
        roughness: 0.95
    })

    // Black matte rim material
    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.85,
        roughness: 0.3,
        emissive: 0x222222,
        emissiveIntensity: 0.25
    })

    const bodyGroup = new THREE.Group()
    helper.add(bodyGroup)

    // FRONT NOSE (very low, wedge shape)
    const frontNose = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.3, 0.8),
        bodyMaterial
    )
    frontNose.position.set(0, 0.2, -2.8)
    frontNose.rotation.x = 0.12
    bodyGroup.add(frontNose)

    // FRONT HOOD
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.35, 1.8),
        bodyMaterial
    )
    hood.position.set(0, 0.35, -1.6)
    hood.rotation.x = -0.1
    bodyGroup.add(hood)

    // MAIN CABIN (very low profile)
    const cabinLower = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.65, 2.5),
        bodyMaterial
    )
    cabinLower.position.set(0, 0.45, 0.0)
    bodyGroup.add(cabinLower)

    // CABIN ROOF
    const cabinRoof = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.45, 1.6),
        bodyMaterial
    )
    cabinRoof.position.set(0, 0.95, -0.1)
    bodyGroup.add(cabinRoof)

    // WINDSHIELD
    const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.5, 0.08),
        windowMaterial
    )
    windshield.position.set(0, 0.85, -0.85)
    windshield.rotation.x = 0.45
    bodyGroup.add(windshield)

    // SIDE WINDOWS
    const windowLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.35, 1.2),
        windowMaterial
    )
    windowLeft.position.set(-1.1, 0.8, 0.0)
    bodyGroup.add(windowLeft)

    const windowRight = windowLeft.clone()
    windowRight.position.set(1.1, 0.8, 0.0)
    bodyGroup.add(windowRight)

    // REAR WINDOW/ENGINE COVER
    const rearWindow = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.3, 0.08),
        windowMaterial
    )
    rearWindow.position.set(0, 0.75, 0.7)
    rearWindow.rotation.x = -0.35
    bodyGroup.add(rearWindow)

    // REAR SECTION
    const rear = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.6, 1.3),
        bodyMaterial
    )
    rear.position.set(0, 0.4, 1.5)
    bodyGroup.add(rear)

    // AIR INTAKES (side scoops)
    const intakeMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        metalness: 0.3,
        roughness: 0.7
    })

    const intakeLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.25, 0.8),
        intakeMaterial
    )
    intakeLeft.position.set(-1.15, 0.35, 0.5)
    bodyGroup.add(intakeLeft)

    const intakeRight = intakeLeft.clone()
    intakeRight.position.set(1.15, 0.35, 0.5)
    bodyGroup.add(intakeRight)

    // REAR DIFFUSER
    const diffuser = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.15, 0.5),
        intakeMaterial
    )
    diffuser.position.set(0, 0.15, 2.1)
    bodyGroup.add(diffuser)

    // WHEELS - Simple design
    const wheelRadius = 0.48
    const wheelWidth = 0.45
    const wheelPositions = [
        { x: -1.25, z: -1.7 },
        { x: 1.25, z: -1.7 },
        { x: -1.3, z: 1.4 },
        { x: 1.3, z: 1.4 }
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
            new THREE.CylinderGeometry(wheelRadius * 0.7, wheelRadius * 0.7, wheelWidth * 0.4, 12),
            rimMaterial
        )
        rim.rotation.z = Math.PI / 2
        wheelGroup.add(rim)

        helper.add(wheelGroup)
    })

    // HEADLIGHTS (angular LED style)
    const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xddddff,
        emissiveIntensity: 1.5
    })

    // Y-shaped headlights (simplified)
    const headlightLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.08, 0.08),
        headlightMaterial
    )
    headlightLeft.position.set(-0.75, 0.35, -2.95)
    bodyGroup.add(headlightLeft)

    const headlightRight = headlightLeft.clone()
    headlightRight.position.set(0.75, 0.35, -2.95)
    bodyGroup.add(headlightRight)

    const headlightLeftUpper = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.08),
        headlightMaterial
    )
    headlightLeftUpper.position.set(-0.85, 0.43, -2.93)
    headlightLeftUpper.rotation.z = 0.5
    bodyGroup.add(headlightLeftUpper)

    const headlightRightUpper = headlightLeftUpper.clone()
    headlightRightUpper.position.set(0.85, 0.43, -2.93)
    headlightRightUpper.rotation.z = -0.5
    bodyGroup.add(headlightRightUpper)

    // TAILLIGHTS
    const taillightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 1.2
    })

    const taillightLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.12, 0.08),
        taillightMaterial
    )
    taillightLeft.position.set(-0.95, 0.55, 2.08)
    bodyGroup.add(taillightLeft)

    const taillightRight = taillightLeft.clone()
    taillightRight.position.set(0.95, 0.55, 2.08)
    bodyGroup.add(taillightRight)

    // Position entire car
    helper.position.y = 0.1

    return helper
}
