import * as THREE from 'three'

/**
 * Creates a Lamborghini 3D model using Three.js geometries
 * LUXURY GRADE - $100,000+ quality with photorealistic materials and aggressive styling
 * Distinctive features: Ultra-low wedge shape, hexagonal design elements, Y-shaped lights
 * Returns a Three.js Group containing the complete car model
 */
export function createLamborghiniModel() {
    const helper = new THREE.Group()

    // PREMIUM MATERIALS - MeshPhysicalMaterial with clearcoat for showroom finish
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xaaff00, // Iconic Lamborghini lime green
        metalness: 0.6,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: 0x335500,
        emissiveIntensity: 0.25
    })

    // Dark tinted glass (almost black for aggressive look)
    const windowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0a,
        metalness: 0,
        roughness: 0.05,
        transmission: 0.85,
        thickness: 0.5,
        emissive: 0x020202,
        emissiveIntensity: 0.1
    })

    // High-quality tire material
    const tireMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.1,
        roughness: 0.95,
        emissive: 0x050505,
        emissiveIntensity: 0.1
    })

    // Black matte racing rim material
    const rimMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2a2a2a,
        metalness: 0.85,
        roughness: 0.3,
        clearcoat: 0.7,
        clearcoatRoughness: 0.2,
        emissive: 0x222222,
        emissiveIntensity: 0.2
    })

    // Brake disc material (carbon ceramic)
    const brakeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x666666,
        metalness: 0.8,
        roughness: 0.3,
        emissive: 0x222222,
        emissiveIntensity: 0.1
    })

    // Yellow brake caliper material (Lamborghini signature)
    const caliperMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffdd00,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x554400,
        emissiveIntensity: 0.3
    })

    // Matte black carbon fiber material
    const carbonMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0a,
        metalness: 0.7,
        roughness: 0.4,
        emissive: 0x020202,
        emissiveIntensity: 0.1
    })

    // Create body container
    const bodyGroup = new THREE.Group()
    helper.add(bodyGroup)

    // === AGGRESSIVE BODY PANELS - SHARP WEDGE DESIGN ===

    // FRONT SPLITTER (aggressive front lip)
    const frontSplitter = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.08, 0.3),
        carbonMaterial
    )
    frontSplitter.position.set(0, 0.08, -3.05)
    bodyGroup.add(frontSplitter)

    // FRONT NOSE (very low, sharp wedge shape)
    const frontNose = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.3, 0.8),
        bodyMaterial
    )
    frontNose.position.set(0, 0.2, -2.8)
    frontNose.rotation.x = 0.12
    bodyGroup.add(frontNose)

    // FRONT HOOD (angular, sloped upward with air vents)
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.35, 1.8),
        bodyMaterial
    )
    hood.position.set(0, 0.35, -1.6)
    hood.rotation.x = -0.1
    bodyGroup.add(hood)

    // HOOD AIR VENTS (functional-looking vents on hood)
    const hoodVentLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.05, 0.6),
        carbonMaterial
    )
    hoodVentLeft.position.set(-0.5, 0.54, -1.5)
    bodyGroup.add(hoodVentLeft)

    const hoodVentRight = hoodVentLeft.clone()
    hoodVentRight.position.set(0.5, 0.54, -1.5)
    bodyGroup.add(hoodVentRight)

    // FRONT FENDERS (wide aggressive fender flares)
    const fenderFrontLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.4, 1.2),
        bodyMaterial
    )
    fenderFrontLeft.position.set(-1.2, 0.35, -1.8)
    bodyGroup.add(fenderFrontLeft)

    const fenderFrontRight = fenderFrontLeft.clone()
    fenderFrontRight.position.set(1.2, 0.35, -1.8)
    bodyGroup.add(fenderFrontRight)

    // MAIN CABIN (very low profile, wedge design)
    const cabinLower = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.65, 2.5),
        bodyMaterial
    )
    cabinLower.position.set(0, 0.45, 0.0)
    bodyGroup.add(cabinLower)

    // SCISSOR DOORS (separate panels with seams)
    const doorLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.6, 1.6),
        bodyMaterial
    )
    doorLeft.position.set(-1.21, 0.45, -0.1)
    bodyGroup.add(doorLeft)

    const doorRight = doorLeft.clone()
    doorRight.position.set(1.21, 0.45, -0.1)
    bodyGroup.add(doorRight)

    // CABIN ROOF (extremely low, angular - removable panel)
    const cabinRoof = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.45, 1.6),
        bodyMaterial
    )
    cabinRoof.position.set(0, 0.95, -0.1)
    bodyGroup.add(cabinRoof)

    // WINDSHIELD (steep angle, Lambo style)
    const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.5, 0.08),
        windowMaterial
    )
    windshield.position.set(0, 0.85, -0.85)
    windshield.rotation.x = 0.45
    bodyGroup.add(windshield)

    // SIDE WINDOWS (angular, small)
    const windowLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.35, 1.2),
        windowMaterial
    )
    windowLeft.position.set(-1.1, 0.8, 0.0)
    bodyGroup.add(windowLeft)

    const windowRight = windowLeft.clone()
    windowRight.position.set(1.1, 0.8, 0.0)
    bodyGroup.add(windowRight)

    // REAR WINDOW/ENGINE COVER (slanted back with glass to show engine)
    const rearWindow = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.3, 0.08),
        windowMaterial
    )
    rearWindow.position.set(0, 0.75, 0.7)
    rearWindow.rotation.x = -0.35
    bodyGroup.add(rearWindow)

    // ENGINE COVER (mid-engine visible through window)
    const engineCover = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.25, 0.8),
        carbonMaterial
    )
    engineCover.position.set(0, 0.5, 0.8)
    bodyGroup.add(engineCover)

    // REAR SECTION (angular, wide with fender flares)
    const rear = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.6, 1.3),
        bodyMaterial
    )
    rear.position.set(0, 0.4, 1.5)
    bodyGroup.add(rear)

    // REAR FENDERS (wide aggressive flares)
    const fenderRearLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.45, 1.4),
        bodyMaterial
    )
    fenderRearLeft.position.set(-1.25, 0.4, 1.4)
    bodyGroup.add(fenderRearLeft)

    const fenderRearRight = fenderRearLeft.clone()
    fenderRearRight.position.set(1.25, 0.4, 1.4)
    bodyGroup.add(fenderRearRight)

    // === LARGE AIR INTAKES (signature Lamborghini side scoops) ===
    
    // Intake housing (larger, more detailed)
    const intakeLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.35, 1.0),
        carbonMaterial
    )
    intakeLeft.position.set(-1.22, 0.4, 0.5)
    bodyGroup.add(intakeLeft)

    const intakeRight = intakeLeft.clone()
    intakeRight.position.set(1.22, 0.4, 0.5)
    bodyGroup.add(intakeRight)

    // Intake mesh pattern (visible grille)
    for (let i = 0; i < 4; i++) {
        const meshBar = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.02, 0.02),
            new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.6 })
        )
        meshBar.position.set(-1.22, 0.3 + (i * 0.08), 0.5)
        bodyGroup.add(meshBar)

        const meshBarRight = meshBar.clone()
        meshBarRight.position.set(1.22, 0.3 + (i * 0.08), 0.5)
        bodyGroup.add(meshBarRight)
    }

    // === REAR DIFFUSER (complex with multiple fins) ===
    
    const diffuser = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.2, 0.6),
        carbonMaterial
    )
    diffuser.position.set(0, 0.12, 2.15)
    diffuser.rotation.x = -0.15
    bodyGroup.add(diffuser)

    // Diffuser fins (multiple channels)
    for (let i = 0; i < 5; i++) {
        const fin = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.15, 0.02),
            carbonMaterial
        )
        fin.position.set(-0.8 + (i * 0.4), 0.08, 2.15)
        fin.rotation.x = -0.15
        bodyGroup.add(fin)
    }

    // === ULTRA-DETAILED WHEELS WITH YELLOW CALIPERS ===
    
    const wheelRadius = 0.48
    const wheelWidth = 0.45
    const wheelPositions = [
        { x: -1.25, z: -1.7, isRear: false },  // Front left
        { x: 1.25, z: -1.7, isRear: false },   // Front right
        { x: -1.3, z: 1.4, isRear: true },     // Rear left (larger)
        { x: 1.3, z: 1.4, isRear: true }       // Rear right (larger)
    ]

    wheelPositions.forEach(pos => {
        const wheelGroup = new THREE.Group()
        const size = pos.isRear ? 1.12 : 1.0 // Staggered fitment (more aggressive)
        wheelGroup.position.set(pos.x, wheelRadius * size, pos.z)

        // BRAKE DISC (carbon ceramic cross-drilled rotor)
        const brakeDisc = new THREE.Mesh(
            new THREE.TorusGeometry(wheelRadius * size * 0.72, 0.09, 16, 64),
            brakeMaterial
        )
        brakeDisc.rotation.y = Math.PI / 2
        wheelGroup.add(brakeDisc)

        // Cross-drilled rotor pattern
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2
            const holeRadius = wheelRadius * size * 0.68
            const hole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.028, 0.028, 0.14, 8),
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

        // YELLOW BRAKE CALIPER (Lamborghini signature)
        const caliper = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.32, 0.14),
            caliperMaterial
        )
        caliper.position.set(pos.x > 0 ? 0.18 : -0.18, wheelRadius * size * 0.4, 0)
        wheelGroup.add(caliper)

        // Caliper detail (brake line)
        const caliperDetail = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8),
            new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.9 })
        )
        caliperDetail.position.set(pos.x > 0 ? 0.18 : -0.18, wheelRadius * size * 0.55, 0)
        wheelGroup.add(caliperDetail)

        // TIRE (TorusGeometry for low-profile performance tire)
        const tire = new THREE.Mesh(
            new THREE.TorusGeometry(wheelRadius * size, wheelWidth * 0.52, 32, 64),
            tireMaterial
        )
        tire.rotation.y = Math.PI / 2
        wheelGroup.add(tire)

        // 12-SPOKE LIGHTWEIGHT FORGED RIM (individual spokes)
        const spokeCount = 12
        for (let i = 0; i < spokeCount; i++) {
            const angle = (i / spokeCount) * Math.PI * 2
            const spoke = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, wheelRadius * size * 0.6, 0.03),
                rimMaterial
            )
            spoke.position.set(
                Math.cos(angle) * wheelRadius * size * 0.42,
                Math.sin(angle) * wheelRadius * size * 0.42,
                0
            )
            spoke.rotation.z = angle
            wheelGroup.add(spoke)
        }

        // RIM CENTER (hub)
        const rimCenter = new THREE.Mesh(
            new THREE.CylinderGeometry(wheelRadius * size * 0.3, wheelRadius * size * 0.3, wheelWidth * 0.45, 64),
            rimMaterial
        )
        rimCenter.rotation.z = Math.PI / 2
        wheelGroup.add(rimCenter)

        // RIM OUTER RING
        const rimOuter = new THREE.Mesh(
            new THREE.TorusGeometry(wheelRadius * size * 0.78, 0.042, 16, 64),
            rimMaterial
        )
        rimOuter.rotation.y = Math.PI / 2
        wheelGroup.add(rimOuter)

        helper.add(wheelGroup)
    })

    // === SIGNATURE LAMBORGHINI DETAILS ===

    // SIDE MIRRORS (low aerodynamic mirror pods)
    const mirrorHousingMaterial = bodyMaterial
    const mirrorGlassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x444444,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x222222,
        emissiveIntensity: 0.1
    })

    // Left mirror (low and aerodynamic)
    const mirrorHousingLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.18),
        mirrorHousingMaterial
    )
    mirrorHousingLeft.position.set(-1.32, 0.7, -0.5)
    bodyGroup.add(mirrorHousingLeft)

    const mirrorGlassLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.06, 0.14),
        mirrorGlassMaterial
    )
    mirrorGlassLeft.position.set(-1.38, 0.7, -0.5)
    bodyGroup.add(mirrorGlassLeft)

    // Right mirror
    const mirrorHousingRight = mirrorHousingLeft.clone()
    mirrorHousingRight.position.set(1.32, 0.7, -0.5)
    bodyGroup.add(mirrorHousingRight)

    const mirrorGlassRight = mirrorGlassLeft.clone()
    mirrorGlassRight.position.set(1.38, 0.7, -0.5)
    bodyGroup.add(mirrorGlassRight)

    // DOOR HANDLES (hidden/flush handles integrated into body)
    const handleMaterial = carbonMaterial

    const handleLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.04, 0.15),
        handleMaterial
    )
    handleLeft.position.set(-1.24, 0.5, -0.1)
    bodyGroup.add(handleLeft)

    const handleRight = handleLeft.clone()
    handleRight.position.set(1.24, 0.5, -0.1)
    bodyGroup.add(handleRight)

    // LAMBORGHINI BADGES (bull logo simulation)
    const badgeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffdd00,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0x554400,
        emissiveIntensity: 0.3
    })

    // Front badge (shield shape simulation)
    const badgeFront = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.18, 0.04),
        badgeMaterial
    )
    badgeFront.position.set(0, 0.25, -3.08)
    bodyGroup.add(badgeFront)

    // Rear badge
    const badgeRear = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.18, 0.04),
        badgeMaterial
    )
    badgeRear.position.set(0, 0.58, 2.18)
    bodyGroup.add(badgeRear)

    // === Y-SHAPED LED HEADLIGHTS (signature Lamborghini design) ===
    
    const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xddddff,
        emissiveIntensity: 1.3
    })

    const headlightHousingMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.3,
        roughness: 0.5
    })

    // Left headlight assembly (Y-shape)
    const headlightHousingLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.25, 0.12),
        headlightHousingMaterial
    )
    headlightHousingLeft.position.set(-0.75, 0.35, -2.98)
    bodyGroup.add(headlightHousingLeft)

    // Y-shape main horizontal bar
    const headlightLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.06, 0.08),
        headlightMaterial
    )
    headlightLeft.position.set(-0.75, 0.35, -2.95)
    bodyGroup.add(headlightLeft)

    // Y-shape upper diagonal
    const headlightLeftUpper = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.05, 0.08),
        headlightMaterial
    )
    headlightLeftUpper.position.set(-0.82, 0.42, -2.93)
    headlightLeftUpper.rotation.z = 0.6
    bodyGroup.add(headlightLeftUpper)

    // Y-shape lower diagonal
    const headlightLeftLower = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.05, 0.08),
        headlightMaterial
    )
    headlightLeftLower.position.set(-0.82, 0.28, -2.93)
    headlightLeftLower.rotation.z = -0.6
    bodyGroup.add(headlightLeftLower)

    // Right headlight assembly (Y-shape mirrored)
    const headlightHousingRight = headlightHousingLeft.clone()
    headlightHousingRight.position.set(0.75, 0.35, -2.98)
    bodyGroup.add(headlightHousingRight)

    const headlightRight = headlightLeft.clone()
    headlightRight.position.set(0.75, 0.35, -2.95)
    bodyGroup.add(headlightRight)

    const headlightRightUpper = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.05, 0.08),
        headlightMaterial
    )
    headlightRightUpper.position.set(0.82, 0.42, -2.93)
    headlightRightUpper.rotation.z = -0.6
    bodyGroup.add(headlightRightUpper)

    const headlightRightLower = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.05, 0.08),
        headlightMaterial
    )
    headlightRightLower.position.set(0.82, 0.28, -2.93)
    headlightRightLower.rotation.z = 0.6
    bodyGroup.add(headlightRightLower)

    // === HEXAGONAL TAILLIGHTS (signature Lamborghini pattern) ===
    
    const taillightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 1.1
    })

    const taillightHousingMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0a,
        metalness: 0.2,
        roughness: 0.6
    })

    // Left taillight (hexagonal housing)
    const taillightHousingLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.12, 6),
        taillightHousingMaterial
    )
    taillightHousingLeft.rotation.x = Math.PI / 2
    taillightHousingLeft.position.set(-0.95, 0.55, 2.12)
    bodyGroup.add(taillightHousingLeft)

    // Hexagonal LED elements (multiple small lights)
    const taillightLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.08, 6),
        taillightMaterial
    )
    taillightLeft.rotation.x = Math.PI / 2
    taillightLeft.position.set(-0.95, 0.55, 2.08)
    bodyGroup.add(taillightLeft)

    // Inner hexagonal detail
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const ledElement = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.04, 0.06),
            taillightMaterial
        )
        ledElement.position.set(
            -0.95 + Math.cos(angle) * 0.08,
            0.55 + Math.sin(angle) * 0.08,
            2.06
        )
        bodyGroup.add(ledElement)
    }

    // Right taillight (hexagonal)
    const taillightHousingRight = taillightHousingLeft.clone()
    taillightHousingRight.position.set(0.95, 0.55, 2.12)
    bodyGroup.add(taillightHousingRight)

    const taillightRight = taillightLeft.clone()
    taillightRight.position.set(0.95, 0.55, 2.08)
    bodyGroup.add(taillightRight)

    // Right inner hexagonal detail
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const ledElement = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.04, 0.06),
            taillightMaterial
        )
        ledElement.position.set(
            0.95 + Math.cos(angle) * 0.08,
            0.55 + Math.sin(angle) * 0.08,
            2.06
        )
        bodyGroup.add(ledElement)
    }

    // === QUAD EXHAUST (four round exhaust tips exiting center) ===
    
    const exhaustMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x444444,
        metalness: 0.95,
        roughness: 0.2,
        emissive: 0x222222,
        emissiveIntensity: 0.2
    })

    // Exhaust positions (quad setup)
    const exhaustPositions = [
        { x: -0.35, y: 0.18 },
        { x: -0.15, y: 0.18 },
        { x: 0.15, y: 0.18 },
        { x: 0.35, y: 0.18 }
    ]

    exhaustPositions.forEach(exhaust => {
        const exhaustTip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.08, 0.18, 32),
            exhaustMaterial
        )
        exhaustTip.rotation.x = Math.PI / 2
        exhaustTip.position.set(exhaust.x, exhaust.y, 2.2)
        bodyGroup.add(exhaustTip)
    })

    // === HEXAGONAL FRONT GRILLE (Lamborghini signature) ===
    
    const grilleMaterial = carbonMaterial

    // Main grille opening (hexagonal)
    const grille = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.1, 6),
        grilleMaterial
    )
    grille.rotation.x = Math.PI / 2
    grille.position.set(0, 0.25, -3.02)
    bodyGroup.add(grille)

    // Hexagonal mesh pattern
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const meshElement = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.02, 0.02),
            new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.6 })
        )
        meshElement.position.set(
            Math.cos(angle) * 0.2,
            0.25 + Math.sin(angle) * 0.2,
            -2.98
        )
        meshElement.rotation.z = angle
        bodyGroup.add(meshElement)
    }

    // === ACTIVE REAR WING (raised position) ===
    
    // Wing mounts
    const wingMountLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.35, 0.08),
        carbonMaterial
    )
    wingMountLeft.position.set(-0.7, 0.75, 2.0)
    bodyGroup.add(wingMountLeft)

    const wingMountRight = wingMountLeft.clone()
    wingMountRight.position.set(0.7, 0.75, 2.0)
    bodyGroup.add(wingMountRight)

    // Wing blade (active spoiler)
    const wing = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.08, 0.35),
        carbonMaterial
    )
    wing.position.set(0, 1.05, 2.0)
    wing.rotation.x = -0.12
    bodyGroup.add(wing)

    // Wing endplates
    const wingEndplateLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.25, 0.3),
        carbonMaterial
    )
    wingEndplateLeft.position.set(-0.9, 1.0, 2.0)
    bodyGroup.add(wingEndplateLeft)

    const wingEndplateRight = wingEndplateLeft.clone()
    wingEndplateRight.position.set(0.9, 1.0, 2.0)
    bodyGroup.add(wingEndplateRight)

    // === ROOF SCOOP (ram air intake for engine) ===
    
    const roofScoop = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.12, 0.3),
        carbonMaterial
    )
    roofScoop.position.set(0, 1.22, 0.5)
    bodyGroup.add(roofScoop)

    // === SIDE SKIRTS (carbon fiber side panels) ===
    
    const sideSkirtLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.15, 3.5),
        carbonMaterial
    )
    sideSkirtLeft.position.set(-1.18, 0.12, -0.2)
    bodyGroup.add(sideSkirtLeft)

    const sideSkirtRight = sideSkirtLeft.clone()
    sideSkirtRight.position.set(1.18, 0.12, -0.2)
    bodyGroup.add(sideSkirtRight)

    // Position entire car (ultra-low supercar stance)
    helper.position.y = 0.1

    return helper
}
