import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import BuildScene from './BuildScene'
import CameraFramer, { type OrbitControlsHandle } from './CameraFramer'

export default function Scene() {
  const controlsRef = useRef<OrbitControlsHandle>(null)

  return (
    <Canvas camera={{ position: [8, 8, 8], fov: 45 }} shadows>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />

      <BuildScene />
      <CameraFramer controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={3}
        maxDistance={40}
      />
    </Canvas>
  )
}
