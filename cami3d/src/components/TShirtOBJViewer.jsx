import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

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
  const obj = useLoader(OBJLoader, "/assets/uploads_files_605564_t+shirts.obj");
  
  // Aplicar configurações do usuario se necessário
  React.useEffect(() => {
    if (obj && config) {
      obj.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.color.set(config.color || '#ffffff');
        }
      });
    }
  }, [obj, config]);

  return <primitive object={obj} scale={[1.5, 1.5, 1.5]} position={[0, -1, 0]} />;
}

export default function TShirtOBJViewer({ config = {} }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }}>
      <Canvas camera={{ position: [0, 1, 5], fov: 50 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
        <Suspense fallback={<LoadingPlaceholder />}>
          <ShirtModel config={config} />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
      </Canvas>
    </div>
  );
}
