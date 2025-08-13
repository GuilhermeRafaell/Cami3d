import { Canvas, useLoader } from '@react-three/fiber'
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

function TShirtModel({ logoUrl, logoScale = 1, logoPosition = { x: 0, y: 0 }, logoRotation = 1 }) {
  const { scene } = useGLTF('/assets/tshirt.glb')
  const meshNames = ['Object_4', 'Object_5', 'Object_6', 'Object_7']
  const meshes = useMemo(() => findMeshesByName(scene, meshNames), [scene])

  // Carrega a textura da imagem do usuário, se houver
  const texture = logoUrl ? useLoader(THREE.TextureLoader, logoUrl) : null

  useEffect(() => {
    if (texture) {
      texture.center.set(0.5, 0.5)
      texture.offset.set(logoPosition.x, logoPosition.y)
      texture.repeat.set(logoScale, -logoScale) // Inverte o eixo Y
      texture.rotation = (logoRotation * Math.PI) / 180
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.needsUpdate = true
    }
    meshes.forEach((mesh) => {
      mesh.castShadow = true
      mesh.receiveShadow = true
      if (mesh.material) {
        if (texture) {
          mesh.material.map = texture
          mesh.material.needsUpdate = true
        } else {
          mesh.material.map = null
          mesh.material.color = new THREE.Color('#ffffff')
        }
        mesh.material.opacity = 1
        mesh.material.transparent = false
        mesh.material.depthTest = true
      }
    })
  }, [texture, logoScale, logoPosition.x, logoPosition.y, logoRotation, meshes])

  return (
    <group scale={4} position={[0, 0, 0]}>
      {meshes.map((mesh) => (
        <primitive object={mesh} key={mesh.uuid} />
      ))}
    </group>
  )
}

function TShirtGLTFViewer({ logoUrl, logoScale, logoPosition, logoRotation }) {
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
        <TShirtModel logoUrl={logoUrl} logoScale={logoScale} logoPosition={logoPosition} logoRotation={logoRotation} />
        <OrbitControls enablePan={true} minDistance={1} maxDistance={10} />
      </Canvas>
    </div>
  )
}

export default TShirtGLTFViewer

// Para funcionar, coloque um arquivo .glb de camiseta em public/assets/tshirt.glb
// Você pode baixar um modelo grátis em sites como Sketchfab, Poly ou CGTrader.
