import { STUD, PLATE_HEIGHT, BRICK_HEIGHT } from '../../lib/grid'

const STUD_RADIUS = STUD * 0.24
const STUD_HEIGHT = PLATE_HEIGHT * 0.5
const BODY_INSET = 0.98 // slight gap so adjacent bricks don't z-fight

type BrickProps = {
  studsX?: number
  studsZ?: number
  color?: string
  opacity?: number
}

type PlasticProps = { color: string; opacity: number; transparent: boolean }

// Glossy injection-molded plastic look via a tight, low-roughness specular
// highlight -- per the plan's "single biggest visual upgrade for the least
// effort." A full clearcoat layer needs environment reflections to read
// correctly and just washes the color out under plain directional lights,
// so this stays on meshStandardMaterial rather than chasing full PBR here.
function Plastic({ color, opacity, transparent }: PlasticProps) {
  return (
    <meshStandardMaterial
      color={color}
      transparent={transparent}
      opacity={opacity}
      roughness={0.3}
      metalness={0.05}
    />
  )
}

// Local origin is the footprint's min corner (0, 0, 0); the brick extends
// toward +X/+Z by studsX/studsZ, matching the grid anchor convention.
export default function Brick({
  studsX = 2,
  studsZ = 4,
  color = '#d33f3f',
  opacity = 1,
}: BrickProps) {
  const transparent = opacity < 1
  const studs: [number, number][] = []
  for (let ix = 0; ix < studsX; ix++) {
    for (let iz = 0; iz < studsZ; iz++) {
      studs.push([ix + 0.5, iz + 0.5])
    }
  }

  return (
    <group>
      <mesh
        position={[(studsX * STUD) / 2, BRICK_HEIGHT / 2, (studsZ * STUD) / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[studsX * STUD * BODY_INSET, BRICK_HEIGHT, studsZ * STUD * BODY_INSET]}
        />
        <Plastic color={color} opacity={opacity} transparent={transparent} />
      </mesh>
      {studs.map(([sx, sz], i) => (
        <mesh
          key={i}
          position={[sx * STUD, BRICK_HEIGHT + STUD_HEIGHT / 2, sz * STUD]}
          castShadow
        >
          <cylinderGeometry args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16]} />
          <Plastic color={color} opacity={opacity} transparent={transparent} />
        </mesh>
      ))}
    </group>
  )
}
