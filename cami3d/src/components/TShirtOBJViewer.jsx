import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { OrbitControls, Text, Environment } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

function LoadingPlaceholder() {
  return (
    <Text
      position={[0, 0, 0]}
      fontSize={0.3}
      color="#666666"
      anchorX="center"
      anchorY="middle"
    >
      Carregando...
    </Text>
  );
}

function ShirtModel({ config }) {
  const obj = useLoader(OBJLoader, "/assets/Male_Tshirt.obj");

  React.useEffect(() => {
    if (obj && config) {
      obj.traverse((child) => {
        if (child.isMesh) {
          // Criar ou atualizar material
          if (!child.material) {
            child.material = new THREE.MeshLambertMaterial();
          }

          // Aplicar cor
          if (config.color) {
            child.material.color.set(config.color);
          }

          // Garantir que o material seja opaco
          child.material.transparent = false;
          child.material.opacity = 1;

          // Habilitar sombras
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [obj, config]);

  // Log para debug
  React.useEffect(() => {
    if (obj) {
      console.log('Modelo Male_Tshirt carregado:', obj);
      obj.traverse((child) => {
        if (child.isMesh) {
          console.log('- Mesh encontrada:', child.name, child.type);
        }
      });
    }
  }, [obj]);

  return (
    <primitive
      object={obj}
      scale={[0.1, 0.1, 0.1]}
      position={[0, -2, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function TShirtOBJViewer({ config = {} }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Canvas 
        camera={{ position: [0, 2, 8], fov: 45 }} 
        shadows
        gl={{ antialias: true }}
      >
        {/* Iluminação melhorada */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, 0, -20]} intensity={0.2} />
        <pointLight position={[0, -10, 0]} intensity={0.2} />
        
        {/* Ambiente para reflexos */}
        <Environment preset="studio" />
        
        <Suspense fallback={<LoadingPlaceholder />}>
          <ShirtModel config={config} />
        </Suspense>
        
        {/* Controles de câmera */}
        <OrbitControls 
          enablePan={true} 
          minDistance={3} 
          maxDistance={20}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
        />
        
        {/* Plano de fundo para sombras */}
        <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
      </Canvas>
    </div>
  );
}
