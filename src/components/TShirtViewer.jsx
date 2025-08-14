import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function TShirt({ color, logo, logoPosition, logoScale, text, textPosition, textColor, textSize, style }) {
  const meshRef = useRef()
  
  // Geometria básica da camiseta baseada no estilo
  const geometry = useMemo(() => {
    switch (style) {
      case 'v-neck':
        return new THREE.CylinderGeometry(0.8, 1.2, 2, 8, 1, false, 0, Math.PI * 2)
      case 'tank-top':
        return new THREE.CylinderGeometry(0.9, 1.1, 2, 8, 1, false, 0, Math.PI * 2)
      case 'long-sleeve':
        return new THREE.CylinderGeometry(1, 1.2, 2, 8, 1, false, 0, Math.PI * 2)
      default: // crew-neck
        return new THREE.CylinderGeometry(1, 1.2, 2, 8, 1, false, 0, Math.PI * 2)
    }
  }, [style])

  return (
    <group>
      {/* Corpo da camiseta */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Mangas (apenas para crew-neck, v-neck e long-sleeve) */}
      {style !== 'tank-top' && (
        <>
          <mesh position={[-1.3, 0.5, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={style === 'long-sleeve' ? [0.3, 0.4, 1.5, 8] : [0.3, 0.4, 1, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[1.3, 0.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={style === 'long-sleeve' ? [0.3, 0.4, 1.5, 8] : [0.3, 0.4, 1, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </>
      )}
      
      {/* Gola */}
      <mesh position={[0, 1.1, 0]}>
        <ringGeometry args={[0.6, style === 'v-neck' ? 0.9 : 0.8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Logo */}
      {logo && (
        <mesh position={[logoPosition.x, logoPosition.y, 1.01]}>
          <planeGeometry args={[0.5 * logoScale, 0.5 * logoScale]} />
          <meshBasicMaterial transparent>
            <primitive attach="map" object={new THREE.TextureLoader().load(logo)} />
          </meshBasicMaterial>
        </mesh>
      )}
      
      {/* Texto */}
      {text && (
        <Text
          position={[textPosition.x, textPosition.y, 1.01]}
          fontSize={textSize}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          font="/fonts/helvetiker_regular.typeface.json"
        >
          {text}
        </Text>
      )}
    </group>
  )
}

function TShirtViewer({ config }) {
  return (
    <div className="tshirt-viewer">
      <div className="viewer-header">
        <h2>Pré-visualização 3D</h2>
        <p>Gire, faça zoom e visualize sua camiseta personalizada</p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        
        <TShirt
          color={config.color}
          logo={config.logo}
          logoPosition={config.logoPosition}
          logoScale={config.logoScale}
          text={config.text}
          textPosition={config.textPosition}
          textColor={config.textColor}
          textSize={config.textSize}
          style={config.style}
        />
        
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      <div className="viewer-controls">
        <p>💡 Dica: Clique e arraste para girar • Role para zoom</p>
      </div>
    </div>
  )
}

export default TShirtViewer
