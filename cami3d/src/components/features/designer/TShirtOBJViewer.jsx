/**
 * TShirtOBJViewer — Visualizador 3D da camiseta usando modelo OBJ.
 * Mantido na pasta features/designer para colocation com a feature de design.
 */
import React, { Suspense } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Text, Environment } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three'

function LoadingPlaceholder() {
  return (
    <Text position={[0, 0, 0]} fontSize={0.3} color="#666666" anchorX="center" anchorY="middle">
      Carregando...
    </Text>
  )
}

function ShirtModel({ config }) {
  const obj = useLoader(OBJLoader, '/assets/Male_Tshirt.obj')
  const [canvasTexture, setCanvasTexture] = React.useState(null)
  const canvasRef = React.useRef(null)

  const loadImageAsync = React.useCallback((src) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`))
      img.src = src
    }), [])

  const createCanvasTexture = React.useCallback(async (cfg) => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
      canvasRef.current.width = 1024
      canvasRef.current.height = 1024
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = cfg.color || '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Logo
    if (cfg.logo) {
      try {
        const img = await loadImageAsync(cfg.logo)
        const scale = cfg.logoScale || 1
        const lx = (cfg.logoPosition?.x || 0) * 300 + canvas.width / 2
        const ly = (cfg.logoPosition?.y || 0) * -300 + canvas.height / 2
        const size = 150 * scale
        ctx.drawImage(img, lx - size / 2, ly - size / 2, size, size)
      } catch (e) {
        console.warn('Erro ao carregar logo:', e.message)
      }
    }

    // Texto
    if (cfg.text) {
      const fontSize = Math.max(32, (cfg.textSize || 0.1) * 400)
      ctx.font = `bold ${fontSize}px Arial, sans-serif`
      ctx.fillStyle = cfg.textColor || '#000000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const tx = (cfg.textPosition?.x || 0) * 200 + canvas.width / 2
      const ty = (cfg.textPosition?.y || -0.3) * -200 + canvas.height / 2
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = Math.max(2, fontSize / 20)
      ctx.strokeText(cfg.text, tx, ty)
      ctx.fillText(cfg.text, tx, ty)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    texture.flipY = false
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.format = THREE.RGBAFormat
    return texture
  }, [loadImageAsync])

  React.useEffect(() => {
    if (!config) return
    createCanvasTexture(config)
      .then(setCanvasTexture)
      .catch(console.error)
  }, [config, createCanvasTexture])

  React.useEffect(() => {
    if (!obj) return
    obj.traverse((child) => {
      if (!child.isMesh) return
      if (!child.material) child.material = new THREE.MeshStandardMaterial()
      if (canvasTexture && (config.text || config.logo)) {
        child.material.map = canvasTexture
        child.material.color.setHex(0xffffff)
      } else {
        child.material.map = null
        child.material.color.set(config.color || '#ffffff')
      }
      child.material.transparent = false
      child.material.opacity = 1
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    })
  }, [obj, config, canvasTexture])

  React.useEffect(() => () => {
    canvasRef.current = null
    canvasTexture?.dispose()
  }, [canvasTexture])

  return (
    <primitive
      object={obj}
      scale={[0.1, 0.1, 0.1]}
      position={[0, -2, 0]}
      rotation={[0, 0, 0]}
    />
  )
}

export default function TShirtOBJViewer({ config = {} }) {
  return (
    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} shadows gl={{ antialias: true }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-10, 0, -20]} intensity={0.2} />
        <pointLight position={[0, -10, 0]} intensity={0.2} />
        <Environment preset="studio" />
        <Suspense fallback={<LoadingPlaceholder />}>
          <ShirtModel config={config} />
        </Suspense>
        <OrbitControls enablePan minDistance={3} maxDistance={20} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 6} />
        <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
      </Canvas>
    </div>
  )
}
