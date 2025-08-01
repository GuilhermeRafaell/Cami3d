import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

function findMeshesByName(object, names) {
  const found = []
  object.traverse((obj) => {
    if (obj.isMesh && names.includes(obj.name)) {
      found.push(obj)
    }
  })
  return found
}

function TShirtModel(props) {
  const { scene } = useGLTF('/assets/tshirt.glb')
  const meshNames = ['Object_4', 'Object_5', 'Object_6', 'Object_7']
  const meshes = useMemo(() => findMeshesByName(scene, meshNames), [scene])

  // Força cor e escala para debug
  meshes.forEach((mesh, idx) => {
    mesh.castShadow = true
    mesh.receiveShadow = true
    if (mesh.material) {
      mesh.material.color = new THREE.Color(['#ff0000', '#00ff00', '#0000ff', '#ffff00'][idx % 4])
      mesh.material.opacity = 1
      mesh.material.transparent = false
      mesh.material.depthTest = true
    }
  })

  return (
    <group {...props} scale={4} position={[0, 0, 0]}>
      {meshes.map((mesh) => (
        <primitive object={mesh} key={mesh.uuid} />
      ))}
    </group>
  )
}

function TShirtGLTFViewer() {
  return (
    <div
      style={{
        width: '100%',
        height: '500px',
        background: '#eee',
        borderRadius: '16px',
      }}
    >
      <Canvas camera={{ position: [0, 1.0, 2.5], fov: 100 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <Environment preset="city" />
        <axesHelper args={[2]} />
        <gridHelper args={[10, 10]} />
        <TShirtModel />
        <OrbitControls enablePan={true} minDistance={1} maxDistance={10} />
      </Canvas>
    </div>
  )
}

export default TShirtGLTFViewer

// Para funcionar, coloque um arquivo .glb de camiseta em public/assets/tshirt.glb
// Você pode baixar um modelo grátis em sites como Sketchfab, Poly ou CGTrader.
