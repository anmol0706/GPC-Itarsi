import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Model3D = ({ modelType = 'book', width = '100%', height = '400px' }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f7); // Light gray background
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create model based on type
    let model;

    if (modelType === 'book') {
      model = createBookModel();
    } else if (modelType === 'computer') {
      model = createComputerModel();
    } else if (modelType === 'atom') {
      model = createAtomModel();
    } else {
      model = createDefaultModel();
    }

    scene.add(model);
    modelRef.current = model;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      renderer.render(scene, camera);
    };
    
    animate();

    // GSAP animation
    gsap.fromTo(
      model.rotation, 
      { y: -Math.PI }, 
      { 
        y: 0, 
        duration: 2, 
        ease: "power3.out" 
      }
    );

    gsap.fromTo(
      model.scale, 
      { x: 0, y: 0, z: 0 }, 
      { 
        x: 1, y: 1, z: 1, 
        duration: 1.5, 
        ease: "elastic.out(1, 0.5)" 
      }
    );

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [modelType]);

  // Helper function to create a book model
  const createBookModel = () => {
    const group = new THREE.Group();
    
    // Book cover
    const coverGeometry = new THREE.BoxGeometry(3, 4, 0.3);
    const coverMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x147efb, // Primary blue
      roughness: 0.5,
      metalness: 0.2
    });
    const cover = new THREE.Mesh(coverGeometry, coverMaterial);
    group.add(cover);
    
    // Book pages
    const pagesGeometry = new THREE.BoxGeometry(2.8, 3.8, 0.2);
    const pagesMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0
    });
    const pages = new THREE.Mesh(pagesGeometry, pagesMaterial);
    pages.position.z = 0.15;
    group.add(pages);
    
    // Book title (simplified as a rectangle)
    const titleGeometry = new THREE.PlaneGeometry(2, 0.5);
    const titleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1
    });
    const title = new THREE.Mesh(titleGeometry, titleMaterial);
    title.position.z = 0.16;
    title.position.y = 1;
    group.add(title);
    
    return group;
  };

  // Helper function to create a computer model
  const createComputerModel = () => {
    const group = new THREE.Group();
    
    // Monitor
    const monitorGeometry = new THREE.BoxGeometry(4, 3, 0.2);
    const monitorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.7
    });
    const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    group.add(monitor);
    
    // Screen
    const screenGeometry = new THREE.PlaneGeometry(3.6, 2.6);
    const screenMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x147efb, // Primary blue
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x147efb,
      emissiveIntensity: 0.2
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.11;
    group.add(screen);
    
    // Stand
    const standGeometry = new THREE.BoxGeometry(1, 1.5, 0.2);
    const standMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      roughness: 0.5,
      metalness: 0.7
    });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.y = -2;
    stand.rotation.x = Math.PI / 4;
    group.add(stand);
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      roughness: 0.5,
      metalness: 0.7
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -2.8;
    group.add(base);
    
    return group;
  };

  // Helper function to create an atom model
  const createAtomModel = () => {
    const group = new THREE.Group();
    
    // Nucleus
    const nucleusGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const nucleusMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff6b33, // Accent orange
      roughness: 0.3,
      metalness: 0.7
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    group.add(nucleus);
    
    // Electron orbits
    const createOrbit = (radius, rotation) => {
      const orbitGeometry = new THREE.TorusGeometry(radius, 0.05, 16, 100);
      const orbitMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x147efb, // Primary blue
        roughness: 0.5,
        metalness: 0.5
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = rotation.x;
      orbit.rotation.y = rotation.y;
      orbit.rotation.z = rotation.z;
      
      // Add electron
      const electronGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const electronMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x147efb, // Primary blue
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0x147efb,
        emissiveIntensity: 0.5
      });
      const electron = new THREE.Mesh(electronGeometry, electronMaterial);
      
      // Position electron on orbit
      const angle = Math.random() * Math.PI * 2;
      electron.position.x = radius * Math.cos(angle);
      electron.position.y = radius * Math.sin(angle);
      
      // Apply orbit rotation to electron position
      const electronGroup = new THREE.Group();
      electronGroup.add(electron);
      electronGroup.rotation.x = rotation.x;
      electronGroup.rotation.y = rotation.y;
      electronGroup.rotation.z = rotation.z;
      
      group.add(orbit);
      group.add(electronGroup);
      
      // Animate electron
      gsap.to(electronGroup.rotation, {
        z: electronGroup.rotation.z + Math.PI * 2,
        duration: 2 + Math.random() * 3,
        ease: "none",
        repeat: -1
      });
    };
    
    // Create three orbits at different angles
    createOrbit(2, { x: 0, y: 0, z: 0 });
    createOrbit(2.5, { x: Math.PI / 3, y: Math.PI / 6, z: 0 });
    createOrbit(3, { x: Math.PI / 2, y: Math.PI / 4, z: Math.PI / 4 });
    
    return group;
  };

  // Helper function to create a default model (cube)
  const createDefaultModel = () => {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x147efb, // Primary blue
      roughness: 0.5,
      metalness: 0.2
    });
    return new THREE.Mesh(geometry, material);
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: width, 
        height: height,
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
};

export default Model3D;
