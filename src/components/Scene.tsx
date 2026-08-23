import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export default function Scene() {
  return (
    <Canvas camera={{ position: [8, 8, 8], fov: 45 }} shadows>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#e5e4e7" />
      </mesh>
      <gridHelper args={[32, 32, '#999999', '#bbbbbb']} />

      <OrbitControls
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={3}
        maxDistance={40}
      />
    </Canvas>
  )
}
