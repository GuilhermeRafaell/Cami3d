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
  const [canvasTexture, setCanvasTexture] = React.useState(null);
  const canvasRef = React.useRef(null);

  // Função para carregar imagem do logo de forma assíncrona
  const loadImageAsync = React.useCallback((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
      img.src = src;
    });
  }, []);

  // Função para criar textura do canvas seguindo a documentação oficial
  const createCanvasTexture = React.useCallback(async (config) => {
    // Criar canvas se não existir ou reutilizar existente
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 1024;  // Maior resolução para melhor qualidade
      canvasRef.current.height = 1024;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Definir cor de fundo da camisa
    ctx.fillStyle = config.color || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    try {
      // Aplicar logo se existir
      if (config.logo) {
        try {
          const img = await loadImageAsync(config.logo);
          const logoScale = config.logoScale || 1;
          const logoX = (config.logoPosition?.x || 0) * 300 + canvas.width / 2;
          const logoY = (config.logoPosition?.y || 0) * -300 + canvas.height / 2;
          const logoSize = 150 * logoScale;
          
          ctx.drawImage(
            img, 
            logoX - logoSize / 2, 
            logoY - logoSize / 2, 
            logoSize, 
            logoSize
          );
          
          console.log(`Logo aplicado na posição (${logoX}, ${logoY}) com tamanho ${logoSize}px`);
        } catch (error) {
          console.warn('Erro ao carregar logo:', error.message);
        }
      }

      // Aplicar texto se existir
      if (config.text) {
        const fontSize = Math.max(32, (config.textSize || 0.1) * 400);
        
        // Configurar fonte com fallbacks
        ctx.font = `bold ${fontSize}px "Arial", "Helvetica", sans-serif`;
        ctx.fillStyle = config.textColor || '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calcular posição do texto
        const textX = (config.textPosition?.x || 0) * 200 + canvas.width / 2;
        const textY = (config.textPosition?.y || -0.3) * -200 + canvas.height / 2;
        
        // Desenhar contorno para melhor legibilidade
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, fontSize / 20);
        ctx.strokeText(config.text, textX, textY);
        
        // Desenhar texto principal
        ctx.fillText(config.text, textX, textY);
        
        console.log(`Texto "${config.text}" aplicado na posição (${textX}, ${textY}) com tamanho ${fontSize}px`);
      }
    } catch (error) {
      console.error('Erro ao processar canvas:', error);
    }

    // Criar CanvasTexture seguindo a documentação
    const texture = new THREE.CanvasTexture(canvas);
    
    // Configurações importantes do CanvasTexture baseadas na documentação
    texture.needsUpdate = true;
    texture.flipY = false; // Para orientação correta no modelo 3D
    texture.wrapS = THREE.ClampToEdgeWrapping;  // Evita repetição horizontal
    texture.wrapT = THREE.ClampToEdgeWrapping;  // Evita repetição vertical
    texture.minFilter = THREE.LinearFilter;     // Filtro suave para minificação
    texture.magFilter = THREE.LinearFilter;     // Filtro suave para magnificação
    texture.generateMipmaps = false;            // Melhor performance para canvas dinâmico
    texture.format = THREE.RGBAFormat;          // Formato para suporte a transparência
    
    console.log('CanvasTexture criada com configurações otimizadas');
    return texture;
  }, [loadImageAsync]);

  // Atualizar textura quando configuração mudar
  React.useEffect(() => {
    if (config) {
      console.log('Atualizando canvas texture...');
      
      // Função assíncrona interna para lidar com createCanvasTexture
      const updateTexture = async () => {
        try {
          const texture = await createCanvasTexture(config);
          setCanvasTexture(texture);
        } catch (error) {
          console.error('Erro ao criar textura:', error);
        }
      };
      
      updateTexture();
    }
  }, [config, createCanvasTexture]);

  // Aplicar textura ao material do objeto
  React.useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child.isMesh) {
          // Criar material se não existir
          if (!child.material) {
            child.material = new THREE.MeshStandardMaterial();
          }

          // Aplicar textura ou cor
          if (canvasTexture && (config.text || config.logo)) {
            // Usar textura do canvas
            child.material.map = canvasTexture;
            child.material.color.setHex(0xffffff); // Base neutra para não afetar a textura
            console.log('Textura canvas aplicada ao material');
          } else {
            // Usar apenas cor sólida
            child.material.map = null;
            child.material.color.set(config.color || '#ffffff');
          }

          // Configurações do material
          child.material.transparent = false;
          child.material.opacity = 1;
          child.material.needsUpdate = true;

          // Sombras
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [obj, config, canvasTexture]);

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

  // Debug e cleanup
  React.useEffect(() => {
    if (obj) {
      console.log('Modelo Male_Tshirt carregado:', obj);
      obj.traverse((child) => {
        if (child.isMesh) {
          console.log('- Mesh encontrada:', child.name, child.type);
        }
      });
    }
    
    // Cleanup: limpar canvas quando componente for desmontado
    return () => {
      if (canvasRef.current) {
        canvasRef.current = null;
      }
      if (canvasTexture) {
        canvasTexture.dispose();
      }
    };
  }, [obj, canvasTexture]);

  // Debug da configuração
  React.useEffect(() => {
    console.log('ShirtModel - Configuração recebida:', config);
    if (config.text) console.log('- Texto:', config.text);
    if (config.logo) console.log('- Logo:', config.logo);
    if (canvasTexture) console.log('- Canvas texture ativa');
  }, [config, canvasTexture]);

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
