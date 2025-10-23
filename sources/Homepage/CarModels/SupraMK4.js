import * as THREE from 'three'

/**
 * Creates a Toyota Supra MK4 3D model using Three.js geometries
 * LUXURY GRADE - $100,000+ quality with photorealistic materials and smooth curves
 * Distinctive features: Low profile, long hood, rounded rear spoiler, iconic styling
 * Returns a Three.js Group containing the complete car model
 */
export function createSupraMK4Model() {
    const helper = new THREE.Group()

    // PREMIUM MATERIALS - MeshPhysicalMaterial with clearcoat for showroom finish
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff8800, // Iconic Supra orange
        metalness: 0.6,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: 0x442200,
        emissiveIntensity: 0.2
    })

    // Realistic tinted glass
    const windowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.5,
        emissive: 0x050505,
        emissiveIntensity: 0.1
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
        color: 0xdddddd,
        metalness: 0.95,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        emissive: 0x555555,
        emissiveIntensity: 0.25
    })

    // Brake disc material (metallic)
    const brakeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.4,
        emissive: 0x222222,
        emissiveIntensity: 0.1
    })

    // Red Brembo-style brake caliper material
    const caliperMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xcc0000,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x440000,
        emissiveIntensity: 0.2
    })

    // Carbon fiber material for accents
    const carbonMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x0a0a0a,
        emissiveIntensity: 0.1
    })

    // Create body container
    const bodyGroup = new THREE.Group()
    helper.add(bodyGroup)

    // === BODY PANELS - SMOOTH CURVES & SEPARATION ===

    // LONG HOOD (smooth curved hood - iconic Supra long nose)
    const hood = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.45),
        bodyMaterial
    )
    hood.position.set(0, 0.5, -1.5)
    hood.scale.set(1.2, 0.5, 1.4)
    bodyGroup.add(hood)

    // FRONT BUMPER (curved, with depth)
    const frontBumper = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.35, 0.5),
        bodyMaterial
    )
    frontBumper.position.set(0, 0.25, -3.0)
    bodyGroup.add(frontBumper)

    // AIR INTAKE (lower front opening)
    const airIntake = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.2, 0.15),
        carbonMaterial
    )
    airIntake.position.set(0, 0.15, -3.05)
    bodyGroup.add(airIntake)

    // FRONT FENDERS (curved bulges)
    const fenderFrontLeft = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 64, 64),
        bodyMaterial
    )
    fenderFrontLeft.position.set(-1.0, 0.5, -1.6)
    fenderFrontLeft.scale.set(0.8, 0.7, 1.2)
    bodyGroup.add(fenderFrontLeft)

    const fenderFrontRight = fenderFrontLeft.clone()
    fenderFrontRight.position.set(1.0, 0.5, -1.6)
    bodyGroup.add(fenderFrontRight)

    // MAIN CABIN (lower and sleeker than Cybertruck)
    const cabinLower = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.8, 2.2),
        bodyMaterial
    )
    cabinLower.position.set(0, 0.6, 0.2)
    bodyGroup.add(cabinLower)

    // DOOR PANELS (separate with seams)
    const doorLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.75, 1.8),
        bodyMaterial
    )
    doorLeft.position.set(-1.15, 0.6, 0.1)
    bodyGroup.add(doorLeft)

    const doorRight = doorLeft.clone()
    doorRight.position.set(1.15, 0.6, 0.1)
    bodyGroup.add(doorRight)

    // CABIN ROOF (smooth curved roof - not flat box)
    const cabinRoof = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.4),
        bodyMaterial
    )
    cabinRoof.position.set(0, 1.35, 0.1)
    cabinRoof.scale.set(1.35, 0.7, 1.2)
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

    // TRUNK/REAR SECTION (separate trunk lid with seam)
    const trunk = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.6, 1.0),
        bodyMaterial
    )
    trunk.position.set(0, 0.5, 1.5)
    bodyGroup.add(trunk)

    // TRUNK LID (separate panel)
    const trunkLid = new THREE.Mesh(
        new THREE.BoxGeometry(2.15, 0.08, 0.95),
        bodyMaterial
    )
    trunkLid.position.set(0, 0.88, 1.5)
    bodyGroup.add(trunkLid)

    // REAR FENDERS (curved bulges)
    const fenderRearLeft = new THREE.Mesh(
        new THREE.SphereGeometry(0.75, 64, 64),
        bodyMaterial
    )
    fenderRearLeft.position.set(-1.05, 0.5, 1.3)
    fenderRearLeft.scale.set(0.85, 0.75, 1.3)
    bodyGroup.add(fenderRearLeft)

    const fenderRearRight = fenderRearLeft.clone()
    fenderRearRight.position.set(1.05, 0.5, 1.3)
    bodyGroup.add(fenderRearRight)

    // REAR BUMPER (with exhaust cutouts)
    const rearBumper = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.4, 0.35),
        bodyMaterial
    )
    rearBumper.position.set(0, 0.3, 2.05)
    bodyGroup.add(rearBumper)

    // === ICONIC REAR SPOILER (enhanced detail) ===
    
    // Spoiler mounts (thicker, more detailed)
    const spoilerMountLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.45, 0.12),
        bodyMaterial
    )
    spoilerMountLeft.position.set(-0.6, 1.0, 2.0)
    bodyGroup.add(spoilerMountLeft)

    const spoilerMountRight = spoilerMountLeft.clone()
    spoilerMountRight.position.set(0.6, 1.0, 2.0)
    bodyGroup.add(spoilerMountRight)

    // Spoiler wing (larger, more detailed)
    const spoilerWing = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.1, 0.45),
        bodyMaterial
    )
    spoilerWing.position.set(0, 1.32, 2.0)
    spoilerWing.rotation.x = -0.1
    bodyGroup.add(spoilerWing)

    // Spoiler endplates
    const endplateLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.3, 0.4),
        bodyMaterial
    )
    endplateLeft.position.set(-1.05, 1.25, 2.0)
    bodyGroup.add(endplateLeft)

    const endplateRight = endplateLeft.clone()
    endplateRight.position.set(1.05, 1.25, 2.0)
    bodyGroup.add(endplateRight)

    // === ULTRA-DETAILED WHEELS WITH RED BREMBO CALIPERS ===
    
    const wheelRadius = 0.45
    const wheelWidth = 0.35
    const wheelPositions = [
        { x: -1.15, z: -1.6, isRear: false },  // Front left
        { x: 1.15, z: -1.6, isRear: false },   // Front right
        { x: -1.15, z: 1.3, isRear: true },    // Rear left (larger)
        { x: 1.15, z: 1.3, isRear: true }      // Rear right (larger)
    ]

    wheelPositions.forEach(pos => {
        const wheelGroup = new THREE.Group()
        const size = pos.isRear ? 1.08 : 1.0 // Staggered fitment
        wheelGroup.position.set(pos.x, wheelRadius * size, pos.z)

        // BRAKE DISC (drilled rotor)
        const brakeDisc = new THREE.Mesh(
            new THREE.TorusGeometry(wheelRadius * size * 0.7, 0.08, 16, 64),
            brakeMaterial
        )
        brakeDisc.rotation.y = Math.PI / 2
        wheelGroup.add(brakeDisc)

        // Drilled rotor pattern (holes in disc)
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2
            const holeRadius = wheelRadius * size * 0.65
            const hole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8),
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

        // RED BRAKE CALIPER (Brembo style)
        const caliper = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.28, 0.12),
            caliperMaterial
        )
        caliper.position.set(pos.x > 0 ? 0.16 : -0.16, wheelRadius * size * 0.35, 0)
        wheelGroup.add(caliper)

        // Brembo logo simulation (small detail box)
        const bremboLogo = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.08, 0.02),
            new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xaaaaaa, emissiveIntensity: 0.5 })
        )
        bremboLogo.position.set(pos.x > 0 ? 0.22 : -0.22, wheelRadius * size * 0.35, 0)
        wheelGroup.add(bremboLogo)

        // TIRE (TorusGeometry for realistic tire shape)
        const tire = new THREE.Mesh(
            new THREE.TorusGeometry(wheelRadius * size, wheelWidth * 0.55, 32, 64),
            tireMaterial
        )
        tire.rotation.y = Math.PI / 2
        wheelGroup.add(tire)

        // 12-SPOKE PERFORMANCE RIM (individual spokes)
        const spokeCount = 12
        for (let i = 0; i < spokeCount; i++) {
            const angle = (i / spokeCount) * Math.PI * 2
            const spoke = new THREE.Mesh(
                new THREE.BoxGeometry(0.055, wheelRadius * size * 0.55, 0.035),
                rimMaterial
            )
            spoke.position.set(
                Math.cos(angle) * wheelRadius * size * 0.4,
                Math.sin(angle) * wheelRadius * size * 0.4,
                0
            )
            spoke.rotation.z = angle
            wheelGroup.add(spoke)
        }

        // RIM CENTER (hub)
        const rimCenter = new THREE.Mesh(
            new THREE.CylinderGeometry(wheelRadius * size * 0.28, wheelRadius * size * 0.28, wheelWidth * 0.5, 64),
            rimMaterial
        )
        rimCenter.rotation.z = Math.PI / 2
        wheelGroup.add(rimCenter)

        // RIM OUTER RING
        const rimOuter = new THREE.Mesh(
            new THREE.TorusGeometry(wheelRadius * size * 0.75, 0.045, 16, 64),
            rimMaterial
        )
        rimOuter.rotation.y = Math.PI / 2
        wheelGroup.add(rimOuter)

        helper.add(wheelGroup)
    })

    // === SIGNATURE SUPRA DETAILS ===

    // SIDE MIRRORS (aerodynamic bullet-style mirrors)
    const mirrorHousingMaterial = bodyMaterial
    const mirrorGlassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x555555,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x222222,
        emissiveIntensity: 0.1
    })

    // Left mirror
    const mirrorHousingLeft = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 32, 32),
        mirrorHousingMaterial
    )
    mirrorHousingLeft.position.set(-1.25, 0.95, -0.4)
    mirrorHousingLeft.scale.set(0.8, 0.7, 1.3)
    bodyGroup.add(mirrorHousingLeft)

    const mirrorGlassLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.15),
        mirrorGlassMaterial
    )
    mirrorGlassLeft.position.set(-1.35, 0.95, -0.4)
    bodyGroup.add(mirrorGlassLeft)

    // Right mirror
    const mirrorHousingRight = mirrorHousingLeft.clone()
    mirrorHousingRight.position.set(1.25, 0.95, -0.4)
    bodyGroup.add(mirrorHousingRight)

    const mirrorGlassRight = mirrorGlassLeft.clone()
    mirrorGlassRight.position.set(1.35, 0.95, -0.4)
    bodyGroup.add(mirrorGlassRight)

    // DOOR HANDLES (flush handles with chrome trim)
    const handleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xcccccc,
        metalness: 0.9,
        roughness: 0.2,
        clearcoat: 0.8
    })

    const handleLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.05, 0.2),
        handleMaterial
    )
    handleLeft.position.set(-1.18, 0.65, 0.1)
    bodyGroup.add(handleLeft)

    const handleRight = handleLeft.clone()
    handleRight.position.set(1.18, 0.65, 0.1)
    bodyGroup.add(handleRight)

    // TOYOTA/SUPRA BADGES
    const badgeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xdddddd,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x444444,
        emissiveIntensity: 0.2
    })

    // Front Toyota badge
    const badgeFront = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.04, 32),
        badgeMaterial
    )
    badgeFront.rotation.x = Math.PI / 2
    badgeFront.position.set(0, 0.4, -3.05)
    bodyGroup.add(badgeFront)

    // Rear Supra badge
    const badgeRear = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.1, 0.04),
        badgeMaterial
    )
    badgeRear.position.set(0, 0.7, 2.08)
    bodyGroup.add(badgeRear)

    // === ROUND HEADLIGHTS (iconic Supra pop-up style housings) ===
    const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffdd,
        emissive: 0xffffbb,
        emissiveIntensity: 1.0
    })

    const headlightHousingMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2a2a2a,
        metalness: 0.3,
        roughness: 0.5
    })

    const headlightCoverMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.1,
        transmission: 0.7,
        thickness: 0.1
    })

    // Left headlight assembly
    const headlightHousingLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.15, 32),
        headlightHousingMaterial
    )
    headlightHousingLeft.rotation.x = Math.PI / 2
    headlightHousingLeft.position.set(-0.85, 0.45, -2.98)
    bodyGroup.add(headlightHousingLeft)

    const headlightLeft = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 32, 32),
        headlightMaterial
    )
    headlightLeft.position.set(-0.85, 0.45, -2.95)
    headlightLeft.scale.set(1, 1, 0.5)
    bodyGroup.add(headlightLeft)

    const headlightCoverLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.08, 32),
        headlightCoverMaterial
    )
    headlightCoverLeft.rotation.x = Math.PI / 2
    headlightCoverLeft.position.set(-0.85, 0.45, -2.92)
    bodyGroup.add(headlightCoverLeft)

    // Right headlight assembly
    const headlightHousingRight = headlightHousingLeft.clone()
    headlightHousingRight.position.set(0.85, 0.45, -2.98)
    bodyGroup.add(headlightHousingRight)

    const headlightRight = headlightLeft.clone()
    headlightRight.position.set(0.85, 0.45, -2.95)
    bodyGroup.add(headlightRight)

    const headlightCoverRight = headlightCoverLeft.clone()
    headlightCoverRight.position.set(0.85, 0.45, -2.92)
    bodyGroup.add(headlightCoverRight)

    // === ROUND TAILLIGHTS (iconic Supra round taillights with reflector detail) ===
    const taillightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff1111,
        emissive: 0xff0000,
        emissiveIntensity: 0.9
    })

    const taillightHousingMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.1,
        roughness: 0.6
    })

    const taillightReflectorMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xcccccc,
        metalness: 0.8,
        roughness: 0.3
    })

    // Left taillight assembly
    const taillightHousingLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.12, 32),
        taillightHousingMaterial
    )
    taillightHousingLeft.rotation.x = Math.PI / 2
    taillightHousingLeft.position.set(-0.9, 0.65, 2.05)
    bodyGroup.add(taillightHousingLeft)

    const taillightReflectorLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.1, 32),
        taillightReflectorMaterial
    )
    taillightReflectorLeft.rotation.x = Math.PI / 2
    taillightReflectorLeft.position.set(-0.9, 0.65, 2.03)
    bodyGroup.add(taillightReflectorLeft)

    const taillightLeft = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 32, 32),
        taillightMaterial
    )
    taillightLeft.position.set(-0.9, 0.65, 1.98)
    taillightLeft.scale.set(1, 1, 0.4)
    bodyGroup.add(taillightLeft)

    // Right taillight assembly
    const taillightHousingRight = taillightHousingLeft.clone()
    taillightHousingRight.position.set(0.9, 0.65, 2.05)
    bodyGroup.add(taillightHousingRight)

    const taillightReflectorRight = taillightReflectorLeft.clone()
    taillightReflectorRight.position.set(0.9, 0.65, 2.03)
    bodyGroup.add(taillightReflectorRight)

    const taillightRight = taillightLeft.clone()
    taillightRight.position.set(0.9, 0.65, 1.98)
    bodyGroup.add(taillightRight)

    // === DUAL EXHAUST (twin round exhaust tips) ===
    const exhaustMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.3,
        emissive: 0x222222,
        emissiveIntensity: 0.1
    })

    // Left exhaust tip
    const exhaustLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.09, 0.15, 32),
        exhaustMaterial
    )
    exhaustLeft.rotation.x = Math.PI / 2
    exhaustLeft.position.set(-0.55, 0.22, 2.12)
    bodyGroup.add(exhaustLeft)

    // Right exhaust tip
    const exhaustRight = exhaustLeft.clone()
    exhaustRight.position.set(0.55, 0.22, 2.12)
    bodyGroup.add(exhaustRight)

    // === FRONT GRILLE (mesh pattern with horizontal slats) ===
    const grilleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.5,
        roughness: 0.5
    })

    const grille = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.25, 0.08),
        grilleMaterial
    )
    grille.position.set(0, 0.35, -3.02)
    bodyGroup.add(grille)

    // Grille slats
    for (let i = 0; i < 5; i++) {
        const slat = new THREE.Mesh(
            new THREE.BoxGeometry(1.35, 0.02, 0.02),
            new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.6 })
        )
        slat.position.set(0, 0.28 + (i * 0.035), -2.98)
        bodyGroup.add(slat)
    }

    // === SIDE VENTS (functional-looking vents behind front wheels) ===
    const ventMaterial = carbonMaterial

    // Left side vent
    const ventLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.2, 0.4),
        ventMaterial
    )
    ventLeft.position.set(-1.18, 0.45, -0.8)
    bodyGroup.add(ventLeft)

    // Right side vent
    const ventRight = ventLeft.clone()
    ventRight.position.set(1.18, 0.45, -0.8)
    bodyGroup.add(ventRight)

    // === ANTENNA (small shark fin on roof) ===
    const antenna = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.12, 16),
        bodyMaterial
    )
    antenna.position.set(0, 1.58, 0.8)
    bodyGroup.add(antenna)

    // Position entire car (low sports car stance)
    helper.position.y = 0.15

    return helper
}
