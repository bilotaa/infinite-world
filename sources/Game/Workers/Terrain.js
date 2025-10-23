import SimplexNoise from './SimplexNoise.js'
import { vec3 } from 'gl-matrix'

let elevationRandom = null

const linearStep = (edgeMin, edgeMax, value) =>
{
    return Math.max(0.0, Math.min(1.0, (value - edgeMin) / (edgeMax - edgeMin)))
}

const smoothStep = (edge0, edge1, x) => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
}

// Road configuration - ENDLESS ROAD
const ROAD_WIDTH = 16.0          // Width of the road (doubled for wider road)
const ROAD_SMOOTH_WIDTH = 4.0    // Additional width for smooth blending
const ROAD_HEIGHT = 0.5          // Height of the road surface
const ROAD_CENTER_X = 0.0        // Road runs along X=0

// Check if a point is on or near the road
const getRoadInfluence = (x, z) => {
    // Road runs along the Z axis at X = ROAD_CENTER_X
    // ENDLESS - no Z bounds, road goes forever
    
    const distanceFromRoadCenter = Math.abs(x - ROAD_CENTER_X)
    const halfRoadWidth = ROAD_WIDTH / 2.0
    const totalWidth = halfRoadWidth + ROAD_SMOOTH_WIDTH
    
    if (distanceFromRoadCenter < halfRoadWidth) {
        // On the road - full influence
        return 1.0
    } else if (distanceFromRoadCenter < totalWidth) {
        // In the smooth blending zone
        const blendDistance = distanceFromRoadCenter - halfRoadWidth
        const blendFactor = 1.0 - (blendDistance / ROAD_SMOOTH_WIDTH)
        return smoothStep(0.0, 1.0, blendFactor)
    }
    
    return 0.0 // Too far from road
}

const getElevation = (x, y, lacunarity, persistence, iterations, baseFrequency, baseAmplitude, power, elevationOffset, iterationsOffsets) =>
{
    let elevation = 0
    let frequency = baseFrequency
    let amplitude = 1
    let normalisation = 0

    for(let i = 0; i < iterations; i++)
    {
        const noise = elevationRandom.noise2D(x * frequency + iterationsOffsets[i][0], y * frequency + iterationsOffsets[i][1])
        elevation += noise * amplitude

        normalisation += amplitude
        amplitude *= persistence
        frequency *= lacunarity
    }

    elevation /= normalisation
    elevation = Math.pow(Math.abs(elevation), power) * Math.sign(elevation)
    elevation *= baseAmplitude
    elevation += elevationOffset

    // Apply road influence
    const roadInfluence = getRoadInfluence(x, y)
    if (roadInfluence > 0.0) {
        // Blend between terrain elevation and road height
        elevation = elevation * (1.0 - roadInfluence) + ROAD_HEIGHT * roadInfluence
    }

    return elevation
}

onmessage = function(event)
{
    const id = event.data.id
    const size = event.data.size
    const baseX = event.data.x
    const baseZ = event.data.z
    const seed = event.data.seed
    const subdivisions = event.data.subdivisions
    const lacunarity = event.data.lacunarity
    const persistence = event.data.persistence
    const iterations = event.data.iterations
    const baseFrequency = event.data.baseFrequency
    const baseAmplitude = event.data.baseAmplitude
    const power = event.data.power
    const elevationOffset = event.data.elevationOffset
    const iterationsOffsets = event.data.iterationsOffsets
    
    const segments = subdivisions + 1
    elevationRandom = new SimplexNoise(seed)
    const grassRandom = new SimplexNoise(seed)

    /**
     * Elevation
     */
    const overflowElevations = new Float32Array((segments + 1) * (segments + 1)) // Bigger to calculate normals more accurately
    const elevations = new Float32Array(segments * segments)
    
    for(let iX = 0; iX < segments + 1; iX++)
    {
        const x = baseX + (iX / subdivisions - 0.5) * size

        for(let iZ = 0; iZ < segments + 1; iZ++)
        {
            const z = baseZ + (iZ / subdivisions - 0.5) * size
            const elevation = getElevation(x, z, lacunarity, persistence, iterations, baseFrequency, baseAmplitude, power, elevationOffset, iterationsOffsets)

            const i = iZ * (segments + 1) + iX
            overflowElevations[i] = elevation

            if(iX < segments && iZ < segments)
            {
                const i = iZ * segments + iX
                elevations[i] = elevation
            }
        }
    }

    /**
     * Positions
     */
    const skirtCount = subdivisions * 4 + 4
    const positions = new Float32Array(segments * segments * 3 + skirtCount * 3)

    for(let iZ = 0; iZ < segments; iZ++)
    {
        const z = baseZ + (iZ / subdivisions - 0.5) * size
        for(let iX = 0; iX < segments; iX++)
        {
            const x = baseX + (iX / subdivisions - 0.5) * size

            const elevation = elevations[iZ * segments + iX]

            const iStride = (iZ * segments + iX) * 3
            positions[iStride    ] = x
            positions[iStride + 1] = elevation
            positions[iStride + 2] = z
        }
    }
    
    /**
     * Normals
     */
    const normals = new Float32Array(segments * segments * 3 + skirtCount * 3)
    
    const interSegmentX = - size / subdivisions
    const interSegmentZ = - size / subdivisions

    for(let iZ = 0; iZ < segments; iZ++)
    {
        for(let iX = 0; iX < segments; iX++)
        {
            // Indexes
            const iOverflowStride = iZ * (segments + 1) + iX

            // Elevations
            const currentElevation = overflowElevations[iOverflowStride]
            const neighbourXElevation = overflowElevations[iOverflowStride + 1]
            const neighbourZElevation = overflowElevations[iOverflowStride + segments + 1]

            // Deltas
            const deltaX = vec3.fromValues(
                interSegmentX,
                currentElevation - neighbourXElevation,
                0
            )

            const deltaZ = vec3.fromValues(
                0,
                currentElevation - neighbourZElevation,
                interSegmentZ
            )

            // Normal
            const normal = vec3.create()
            vec3.cross(normal, deltaZ, deltaX)
            vec3.normalize(normal, normal)

            const iStride = (iZ * segments + iX) * 3
            normals[iStride    ] = normal[0]
            normals[iStride + 1] = normal[1]
            normals[iStride + 2] = normal[2]
        }
    }

    /**
     * UV
     */
    const uv = new Float32Array(segments * segments * 2 + skirtCount * 2)

    for(let iZ = 0; iZ < segments; iZ++)
    {
        for(let iX = 0; iX < segments; iX++)
        {
            const iStride = (iZ * segments + iX) * 2
            uv[iStride    ] = iX / (segments - 1)
            uv[iStride + 1] = iZ / (segments - 1)
        }
    }

    /**
     * Indices
     */
    const indicesCount = subdivisions * subdivisions
    const indices = new (indicesCount < 65535 ? Uint16Array : Uint32Array)(indicesCount * 6 + subdivisions * 4 * 6 * 4)
    
    for(let iZ = 0; iZ < subdivisions; iZ++)
    {
        for(let iX = 0; iX < subdivisions; iX++)
        {
            const row = subdivisions + 1
            const a = iZ * row + iX
            const b = iZ * row + (iX + 1)
            const c = (iZ + 1) * row + iX
            const d = (iZ + 1) * row + (iX + 1)

            const iStride = (iZ * subdivisions + iX) * 6
            indices[iStride    ] = a
            indices[iStride + 1] = d
            indices[iStride + 2] = b

            indices[iStride + 3] = d
            indices[iStride + 4] = a
            indices[iStride + 5] = c
        }
    }
    
    /**
     * Skirt
     */
    let skirtIndex = segments * segments
    let indicesSkirtIndex = segments * segments

    // North (negative Z)
    for(let iX = 0; iX < segments; iX++)
    {
        const iZ = 0
        const iPosition = iZ * segments + iX
        const iPositionStride = iPosition * 3

        // Position
        positions[skirtIndex * 3    ] = positions[iPositionStride + 0]
        positions[skirtIndex * 3 + 1] = positions[iPositionStride + 1] - 15
        positions[skirtIndex * 3 + 2] = positions[iPositionStride + 2]

        // Normal
        normals[skirtIndex * 3    ] = normals[iPositionStride + 0]
        normals[skirtIndex * 3 + 1] = normals[iPositionStride + 1]
        normals[skirtIndex * 3 + 2] = normals[iPositionStride + 2]
        
        // UV
        uv[skirtIndex * 2    ] = iZ / (segments - 1)
        uv[skirtIndex * 2 + 1] = iX / (segments - 1)

        // Index
        if(iX < segments - 1)
        {
            const a = iPosition
            const b = iPosition + 1
            const c = skirtIndex
            const d = skirtIndex + 1

            const iIndexStride = indicesSkirtIndex * 6
            indices[iIndexStride    ] = b
            indices[iIndexStride + 1] = d
            indices[iIndexStride + 2] = a

            indices[iIndexStride + 3] = c
            indices[iIndexStride + 4] = a
            indices[iIndexStride + 5] = d

            indicesSkirtIndex++
        }

        skirtIndex++
    }
    
    // South (positive Z)
    for(let iX = 0; iX < segments; iX++)
    {
        const iZ = segments - 1
        const iPosition = iZ * segments + iX
        const iPositionStride = iPosition * 3

        // Position
        positions[skirtIndex * 3    ] = positions[iPositionStride + 0]
        positions[skirtIndex * 3 + 1] = positions[iPositionStride + 1] - 15
        positions[skirtIndex * 3 + 2] = positions[iPositionStride + 2]

        // Normal
        normals[skirtIndex * 3    ] = normals[iPositionStride + 0]
        normals[skirtIndex * 3 + 1] = normals[iPositionStride + 1]
        normals[skirtIndex * 3 + 2] = normals[iPositionStride + 2]
        
        // UV
        uv[skirtIndex * 2    ] = iZ / (segments - 1)
        uv[skirtIndex * 2 + 1] = iX / (segments - 1)

        // Index
        if(iX < segments - 1)
        {
            const a = iPosition
            const b = iPosition + 1
            const c = skirtIndex
            const d = skirtIndex + 1

            const iIndexStride = indicesSkirtIndex * 6
            indices[iIndexStride    ] = a
            indices[iIndexStride + 1] = c
            indices[iIndexStride + 2] = b

            indices[iIndexStride + 3] = d
            indices[iIndexStride + 4] = b
            indices[iIndexStride + 5] = c

            indicesSkirtIndex++
        }
        
        skirtIndex++
    }

    // West (negative X)
    for(let iZ = 0; iZ < segments; iZ++)
    {
        const iX = 0
        const iPosition = (iZ * segments + iX)
        const iPositionStride = iPosition * 3

        // Position
        positions[skirtIndex * 3    ] = positions[iPositionStride + 0]
        positions[skirtIndex * 3 + 1] = positions[iPositionStride + 1] - 15
        positions[skirtIndex * 3 + 2] = positions[iPositionStride + 2]

        // Normal
        normals[skirtIndex * 3    ] = normals[iPositionStride + 0]
        normals[skirtIndex * 3 + 1] = normals[iPositionStride + 1]
        normals[skirtIndex * 3 + 2] = normals[iPositionStride + 2]
        
        // UV
        uv[skirtIndex * 2    ] = iZ / (segments - 1)
        uv[skirtIndex * 2 + 1] = iX

        // Index
        if(iZ < segments - 1)
        {
            const a = iPosition
            const b = iPosition + segments
            const c = skirtIndex
            const d = skirtIndex + 1

            const iIndexStride = indicesSkirtIndex * 6
            indices[iIndexStride    ] = a
            indices[iIndexStride + 1] = c
            indices[iIndexStride + 2] = b

            indices[iIndexStride + 3] = d
            indices[iIndexStride + 4] = b
            indices[iIndexStride + 5] = c

            indicesSkirtIndex++
        }

        skirtIndex++
    }

    for(let iZ = 0; iZ < segments; iZ++)
    {
        const iX = segments - 1
        const iPosition = (iZ * segments + iX)
        const iPositionStride = iPosition * 3

        // Position
        positions[skirtIndex * 3    ] = positions[iPositionStride + 0]
        positions[skirtIndex * 3 + 1] = positions[iPositionStride + 1] - 15
        positions[skirtIndex * 3 + 2] = positions[iPositionStride + 2]

        // Normal
        normals[skirtIndex * 3    ] = normals[iPositionStride + 0]
        normals[skirtIndex * 3 + 1] = normals[iPositionStride + 1]
        normals[skirtIndex * 3 + 2] = normals[iPositionStride + 2]
        
        // UV
        uv[skirtIndex * 2    ] = iZ / (segments - 1)
        uv[skirtIndex * 2 + 1] = iX / (segments - 1)

        // Index
        if(iZ < segments - 1)
        {
            const a = iPosition
            const b = iPosition + segments
            const c = skirtIndex
            const d = skirtIndex + 1

            const iIndexStride = indicesSkirtIndex * 6
            indices[iIndexStride    ] = b
            indices[iIndexStride + 1] = d
            indices[iIndexStride + 2] = a

            indices[iIndexStride + 3] = c
            indices[iIndexStride + 4] = a
            indices[iIndexStride + 5] = d

            indicesSkirtIndex++
        }

        skirtIndex++
    }

    /**
     * Texture
     */
    const texture = new Float32Array(segments * segments * 4)

    for(let iZ = 0; iZ < segments; iZ++)
    {
        for(let iX = 0; iX < segments; iX++)
        {
            const iPositionStride = (iZ * segments + iX) * 3
            const position = vec3.fromValues(
                positions[iPositionStride    ],
                positions[iPositionStride + 1],
                positions[iPositionStride + 2]
            )

            // Normal
            const iNormalStride = (iZ * segments + iX) * 3
            const normal = vec3.fromValues(
                normals[iNormalStride    ],
                normals[iNormalStride + 1],
                normals[iNormalStride + 2]
            )

            // Grass
            const upward = Math.max(0, normal[1])
            let grass = 0;

            if(position[1] > 0)
            {
                const grassFrequency = 0.05
                let grassNoise = grassRandom.noise2D(position[0] * grassFrequency + iterationsOffsets[0][0], position[2] * grassFrequency + iterationsOffsets[0][0])
                grassNoise = linearStep(- 0.5, 0, grassNoise);
                
                const grassUpward = linearStep(0.9, 1, upward);
                
                grass = grassNoise * grassUpward
            }

            // Final texture
            const iTextureStride = (iZ * segments  + iX) * 4
            texture[iTextureStride    ] = normals[iNormalStride    ]
            texture[iTextureStride + 1] = normals[iNormalStride + 1]
            texture[iTextureStride + 2] = normals[iNormalStride + 2]
            texture[iTextureStride + 3] = position[1]
        }
    }

    // Post
    postMessage({
        id: id,
        positions: positions,
        normals: normals,
        indices: indices,
        texture: texture,
        uv: uv
    })
}