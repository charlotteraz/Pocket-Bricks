import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import BuildScene from './BuildScene'
import CameraFramer, { type OrbitControlsHandle } from './CameraFramer'

export default function Scene() {
  const controlsRef = useRef<OrbitControlsHandle>(null)

  return (
    <Canvas camera={{ position: [8, 8, 8], fov: 45 }} shadows>
      {/* Soft studio lighting: a bright, low ambient plus one shadow-casting
          key light and two dim fill/rim lights so nothing goes fully dark. */}
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 10, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-6, 4, -3]} intensity={0.25} />
      <directionalLight position={[0, 3, -8]} intensity={0.2} />

      <BuildScene />
      <CameraFramer controlsRef={controlsRef} />
      <ContactShadows position={[0, -0.001, 0]} opacity={0.35} scale={32} blur={2} far={4} />

      <OrbitControls
        ref={controlsRef}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={3}
        maxDistance={40}
      />
    </Canvas>
  )
}
