import * as THREE from 'three'

/**
 * Creates a Tesla Cybertruck 3D model using Three.js geometries
 * LUXURY GRADE - $100,000+ quality with photorealistic materials and details
 * Returns a Three.js Group containing the complete car model
 */
export function createCybertruckModel() {
    const helper = new THREE.Group()

    // PREMIUM MATERIALS - MeshPhysicalMaterial with clearcoat for showroom finish
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe8e8e8, // Bright stainless steel
        metalness: 0.6,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: 0x666666,
        emissiveIntensity: 0.3
    })

    // Realistic tinted glass
    const windowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2a2a2a,
        metalness: 0,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.5,
        emissive: 0x0a0a0a,
        emissiveIntensity: 0.2
    })

    // High-quality tire material
    const tireMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.1,
        roughness: 0.9,
        emissive: 0x050505,
        emissiveIntensity: 0.1
    })

    // Ultra-chrome rim material
    const rimMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xcccccc,
        metalness: 0.95,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        emissive: 0x444444,
        emissiveIntensity: 0.2
    })

    // Brake disc material (metallic)
    const brakeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.4,
        emissive: 0x222222,
        emissiveIntensity: 0.1
    })

    // Red brake caliper material
    const caliperMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x440000,
        emissiveIntensity: 0.2
    })

    // Create body container for suspension movement
    const bodyGroup = new THREE.Group()
    helper.add(bodyGroup)

    // === BODY PANELS - SEPARATED FOR REALISM ===

    // TRUCK BED (back part) - main bed
    const bed = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.2, 3),
        bodyMaterial
    )
    bed.position.set(0, 0.6, 0.5)
    bodyGroup.add(bed)

    // TAILGATE (separate panel)
    const tailgate = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.0, 0.15),
        bodyMaterial
    )
    tailgate.position.set(0, 0.5, 2.05)
    bodyGroup.add(tailgate)

    // CABIN (front part) - lower part with door separation
    const cabinLower = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.0, 2),
        bodyMaterial
    )
    cabinLower.position.set(0, 0.5, -1.5)
    bodyGroup.add(cabinLower)

    // DOOR PANELS (visible seams)
    const doorLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.9, 1.5),
        bodyMaterial
    )
    doorLeft.position.set(-1.31, 0.5, -1.5)
    bodyGroup.add(doorLeft)

    const doorRight = doorLeft.clone()
    doorRight.position.set(1.31, 0.5, -1.5)
    bodyGroup.add(doorRight)

    // CABIN - upper part (slanted roof)
    const cabinUpper = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.8, 1.5),
        bodyMaterial
    )
    cabinUpper.position.set(0, 1.3, -1.3)
    cabinUpper.rotation.x = -0.15
    bodyGroup.add(cabinUpper)

    // WINDSHIELD (angular, dark)
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

    // FRONT HOOD/NOSE (separate panel with frunk)
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.6, 0.8),
        bodyMaterial
    )
    hood.position.set(0, 0.5, -2.8)
    hood.rotation.x = 0.1
    bodyGroup.add(hood)

    // FRUNK PANEL (front trunk lid - seam)
    const frunk = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.55, 0.75),
        bodyMaterial
    )
    frunk.position.set(0, 0.52, -2.8)
    frunk.rotation.x = 0.1
    bodyGroup.add(frunk)

    // === ULTRA-DETAILED WHEELS WITH BRAKE SYSTEM ===
    
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

        // BRAKE DISC (drilled rotor)
        const brakeDisc = new THREE.Mesh(
            new THREE.TorusGeometry(wheelRadius * 0.65, 0.08, 16, 64),
            brakeMaterial
        )
        brakeDisc.rotation.y = Math.PI / 2
        wheelGroup.add(brakeDisc)

        // Drilled rotor pattern (holes in disc)
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2
            const holeRadius = wheelRadius * 0.6
            const hole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8),
                new THREE.MeshPhysicalMaterial({ color: 0x000000 })
            )
            hole.position.set(
                Math.cos(angle) * holeRadius,
                0,
                Math.sin(angle) * holeRadius
            )
            hole.rotation.y = Math.PI / 2
            brakeDisc.add(hole)
        }

        // BRAKE CALIPER (red)
        const caliper = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.25, 0.12),
            caliperMaterial
        )
        caliper.position.set(pos.x > 0 ? 0.15 : -0.15, wheelRadius * 0.3, 0)
        wheelGroup.add(caliper)

        // TIRE (TorusGeometry for realistic tire shape)
        const tire = new THREE.Mesh(
            new THREE.TorusGeometry(wheelRadius, wheelWidth * 0.55, 32, 64),
            tireMaterial
        )
        tire.rotation.y = Math.PI / 2
        wheelGroup.add(tire)

        // 12-SPOKE RIM (individual spokes for ultra-detail)
        const spokeCount = 12
        for (let i = 0; i < spokeCount; i++) {
            const angle = (i / spokeCount) * Math.PI * 2
            const spoke = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, wheelRadius * 0.5, 0.04),
                rimMaterial
            )
            spoke.position.set(
                Math.cos(angle) * wheelRadius * 0.35,
                Math.sin(angle) * wheelRadius * 0.35,
                0
            )
            spoke.rotation.z = angle
            wheelGroup.add(spoke)
        }

        // RIM CENTER (hub)
        const rimCenter = new THREE.Mesh(
            new THREE.CylinderGeometry(wheelRadius * 0.25, wheelRadius * 0.25, wheelWidth * 0.5, 64),
            rimMaterial
        )
        rimCenter.rotation.z = Math.PI / 2
        wheelGroup.add(rimCenter)

        // RIM OUTER RING
        const rimOuter = new THREE.Mesh(
            new THREE.TorusGeometry(wheelRadius * 0.7, 0.05, 16, 64),
            rimMaterial
        )
        rimOuter.rotation.y = Math.PI / 2
        wheelGroup.add(rimOuter)

        helper.add(wheelGroup)
    })

    // === DETAIL COMPONENTS ===

    // SIDE MIRRORS (angular Cybertruck style)
    const mirrorMaterial = bodyMaterial
    const mirrorGlassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x666666,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x222222,
        emissiveIntensity: 0.1
    })

    // Left mirror
    const mirrorHousingLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.12, 0.25),
        mirrorMaterial
    )
    mirrorHousingLeft.position.set(-1.35, 1.0, -1.8)
    bodyGroup.add(mirrorHousingLeft)

    const mirrorGlassLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.1, 0.2),
        mirrorGlassMaterial
    )
    mirrorGlassLeft.position.set(-1.42, 1.0, -1.8)
    bodyGroup.add(mirrorGlassLeft)

    // Right mirror
    const mirrorHousingRight = mirrorHousingLeft.clone()
    mirrorHousingRight.position.set(1.35, 1.0, -1.8)
    bodyGroup.add(mirrorHousingRight)

    const mirrorGlassRight = mirrorGlassLeft.clone()
    mirrorGlassRight.position.set(1.42, 1.0, -1.8)
    bodyGroup.add(mirrorGlassRight)

    // DOOR HANDLES (flush/hidden handles)
    const handleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xa0a0a0,
        metalness: 0.5,
        roughness: 0.3
    })

    const handleLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.06, 0.25),
        handleMaterial
    )
    handleLeft.position.set(-1.28, 0.7, -1.5)
    bodyGroup.add(handleLeft)

    const handleRight = handleLeft.clone()
    handleRight.position.set(1.28, 0.7, -1.5)
    bodyGroup.add(handleRight)

    // TESLA BADGE (front and rear)
    const badgeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xdddddd,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x444444,
        emissiveIntensity: 0.2
    })

    // Front "T" badge
    const badgeFront = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.05),
        badgeMaterial
    )
    badgeFront.position.set(0, 0.5, -3.17)
    bodyGroup.add(badgeFront)

    // Rear "TESLA" badge
    const badgeRear = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.1, 0.05),
        badgeMaterial
    )
    badgeRear.position.set(0, 1.0, 2.08)
    bodyGroup.add(badgeRear)

    // WINDSHIELD WIPER (single wiper across windshield)
    const wiperMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.4,
        roughness: 0.6
    })

    const wiper = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.03, 0.04),
        wiperMaterial
    )
    wiper.position.set(0, 0.85, -2.3)
    wiper.rotation.x = 0.3
    bodyGroup.add(wiper)

    // BED COVER (tonneau cover on truck bed)
    const bedCover = new THREE.Mesh(
        new THREE.BoxGeometry(2.45, 0.08, 2.95),
        bodyMaterial
    )
    bedCover.position.set(0, 1.24, 0.5)
    bodyGroup.add(bedCover)

    // === ENHANCED HEADLIGHTS (LED housings with covers) ===
    const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffee,
        emissive: 0xffffaa,
        emissiveIntensity: 1.2
    })

    const headlightHousingMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x333333,
        metalness: 0.2,
        roughness: 0.5
    })

    const headlightCoverMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.1,
        transmission: 0.8,
        thickness: 0.1
    })

    // Left headlight
    const headlightHousingLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.15, 0.12),
        headlightHousingMaterial
    )
    headlightHousingLeft.position.set(-0.8, 0.6, -3.15)
    bodyGroup.add(headlightHousingLeft)

    const headlightLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.1, 0.08),
        headlightMaterial
    )
    headlightLeft.position.set(-0.8, 0.6, -3.1)
    bodyGroup.add(headlightLeft)

    const headlightCoverLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.12, 0.05),
        headlightCoverMaterial
    )
    headlightCoverLeft.position.set(-0.8, 0.6, -3.08)
    bodyGroup.add(headlightCoverLeft)

    // Right headlight
    const headlightHousingRight = headlightHousingLeft.clone()
    headlightHousingRight.position.set(0.8, 0.6, -3.15)
    bodyGroup.add(headlightHousingRight)

    const headlightRight = headlightLeft.clone()
    headlightRight.position.set(0.8, 0.6, -3.1)
    bodyGroup.add(headlightRight)

    const headlightCoverRight = headlightCoverLeft.clone()
    headlightCoverRight.position.set(0.8, 0.6, -3.08)
    bodyGroup.add(headlightCoverRight)

    // === ENHANCED TAILLIGHTS (light bar structure) ===
    const taillightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff2222,
        emissive: 0xff0000,
        emissiveIntensity: 0.8
    })

    const taillightHousingMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.1,
        roughness: 0.6
    })

    // Left taillight with housing
    const taillightHousingLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.2, 0.12),
        taillightHousingMaterial
    )
    taillightHousingLeft.position.set(-1.0, 0.9, 2.05)
    bodyGroup.add(taillightHousingLeft)

    const taillightLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.15, 0.08),
        taillightMaterial
    )
    taillightLeft.position.set(-1.0, 0.9, 2.03)
    bodyGroup.add(taillightLeft)

    // Right taillight with housing
    const taillightHousingRight = taillightHousingLeft.clone()
    taillightHousingRight.position.set(1.0, 0.9, 2.05)
    bodyGroup.add(taillightHousingRight)

    const taillightRight = taillightLeft.clone()
    taillightRight.position.set(1.0, 0.9, 2.03)
    bodyGroup.add(taillightRight)

    // Center light bar connecting taillights
    const lightBar = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.08, 0.08),
        taillightMaterial
    )
    lightBar.position.set(0, 0.9, 2.03)
    bodyGroup.add(lightBar)

    // Position entire truck above ground
    helper.position.y = 0.2

    return helper
}
