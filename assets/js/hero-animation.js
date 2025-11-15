/**
 * Three.js Hero Section Animation
 * Interactive particle network with 3D geometries and scroll-based effects
 * Optimized for performance with lazy loading and responsive design
 */

(function() {
  'use strict';

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. Hero animation will not run.');
    return;
  }

  // Configuration
  const config = {
    particles: {
      count: 150,
      size: 2,
      connectionDistance: 150,
      speed: 0.3
    },
    geometries: {
      count: 15,
      types: ['box', 'sphere', 'torus', 'octahedron'],
      sizes: [0.3, 0.5, 0.7],
      rotationSpeed: 0.01
    },
    mouse: {
      parallaxStrength: 0.05,
      influenceRadius: 200
    },
    colors: {
      light: {
        particles: 0x3b82f6,
        geometries: 0x8b5cf6,
        connections: 0x60a5fa
      },
      dark: {
        particles: 0x60a5fa,
        geometries: 0xa78bfa,
        connections: 0x3b82f6
      }
    }
  };

  // Animation state
  let scene, camera, renderer;
  let particleSystem, particlePositions, particleVelocities;
  let geometryObjects = [];
  let lineSystem;
  let animationFrameId;
  let isInitialized = false;
  let isDarkMode = false;

  // Mouse tracking
  let mouse = { x: 0, y: 0 };
  let targetMouse = { x: 0, y: 0 };

  // Scroll tracking
  let scrollProgress = 0;

  // DOM elements
  const canvas = document.getElementById('hero-canvas');
  const heroSection = document.getElementById('hero');

  if (!canvas || !heroSection) {
    console.warn('Hero canvas or section not found');
    return;
  }

  /**
   * Initialize Three.js scene
   */
  function initScene() {
    // Create scene
    scene = new THREE.Scene();

    // Setup camera
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.z = 50;

    // Create renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Check dark mode
    isDarkMode = document.body.classList.contains('dark-mode');

    // Create particle network
    createParticleNetwork();

    // Create 3D geometries
    create3DGeometries();

    // Add lighting
    addLights();

    isInitialized = true;
  }

  /**
   * Create interactive particle network
   */
  function createParticleNetwork() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    particlePositions = [];
    particleVelocities = [];

    const color = new THREE.Color(isDarkMode ? config.colors.dark.particles : config.colors.light.particles);

    // Create particles
    for (let i = 0; i < config.particles.count; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 50;

      vertices.push(x, y, z);
      colors.push(color.r, color.g, color.b);

      particlePositions.push({ x, y, z });
      particleVelocities.push({
        x: (Math.random() - 0.5) * config.particles.speed,
        y: (Math.random() - 0.5) * config.particles.speed,
        z: (Math.random() - 0.5) * config.particles.speed * 0.5
      });
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: config.particles.size,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Create line system for connections
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(config.particles.count * config.particles.count * 6);
    const lineColors = new Float32Array(config.particles.count * config.particles.count * 6);

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    lineSystem = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSystem);
  }

  /**
   * Create floating 3D geometries
   */
  function create3DGeometries() {
    const geometryTypes = {
      box: () => new THREE.BoxGeometry(1, 1, 1),
      sphere: () => new THREE.SphereGeometry(0.5, 16, 16),
      torus: () => new THREE.TorusGeometry(0.4, 0.15, 16, 32),
      octahedron: () => new THREE.OctahedronGeometry(0.5, 0)
    };

    for (let i = 0; i < config.geometries.count; i++) {
      // Random geometry type
      const type = config.geometries.types[Math.floor(Math.random() * config.geometries.types.length)];
      const geometry = geometryTypes[type]();

      // Random size
      const size = config.geometries.sizes[Math.floor(Math.random() * config.geometries.sizes.length)];

      const material = new THREE.MeshPhongMaterial({
        color: isDarkMode ? config.colors.dark.geometries : config.colors.light.geometries,
        transparent: true,
        opacity: 0.15,
        shininess: 100,
        wireframe: Math.random() > 0.5
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Random position
      mesh.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 30
      );

      mesh.scale.setScalar(size);

      // Random rotation
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      geometryObjects.push({
        mesh: mesh,
        rotationSpeed: {
          x: (Math.random() - 0.5) * config.geometries.rotationSpeed,
          y: (Math.random() - 0.5) * config.geometries.rotationSpeed,
          z: (Math.random() - 0.5) * config.geometries.rotationSpeed
        },
        floatSpeed: Math.random() * 0.5 + 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        initialY: mesh.position.y
      });

      scene.add(mesh);
    }
  }

  /**
   * Add lights to the scene
   */
  function addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x3b82f6, 1, 100);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1, 100);
    pointLight2.position.set(-20, -20, 20);
    scene.add(pointLight2);
  }

  /**
   * Update particle positions and create connections
   */
  function updateParticles(time) {
    const positions = particleSystem.geometry.attributes.position.array;

    // Update particle positions
    for (let i = 0; i < config.particles.count; i++) {
      const i3 = i * 3;

      // Update position based on velocity
      particlePositions[i].x += particleVelocities[i].x;
      particlePositions[i].y += particleVelocities[i].y;
      particlePositions[i].z += particleVelocities[i].z;

      // Bounce off boundaries
      if (Math.abs(particlePositions[i].x) > 50) particleVelocities[i].x *= -1;
      if (Math.abs(particlePositions[i].y) > 50) particleVelocities[i].y *= -1;
      if (Math.abs(particlePositions[i].z) > 25) particleVelocities[i].z *= -1;

      // Mouse influence
      const dx = mouse.x * 50 - particlePositions[i].x;
      const dy = mouse.y * 50 - particlePositions[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < config.mouse.influenceRadius) {
        const force = (1 - distance / config.mouse.influenceRadius) * 0.1;
        particlePositions[i].x += dx * force;
        particlePositions[i].y += dy * force;
      }

      // Scroll influence
      particlePositions[i].y += Math.sin(scrollProgress * Math.PI) * 0.05;

      positions[i3] = particlePositions[i].x;
      positions[i3 + 1] = particlePositions[i].y;
      positions[i3 + 2] = particlePositions[i].z;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;

    // Update connections
    updateConnections();
  }

  /**
   * Update particle connections
   */
  function updateConnections() {
    const linePositions = lineSystem.geometry.attributes.position.array;
    const lineColors = lineSystem.geometry.attributes.color.array;

    const connectionColor = new THREE.Color(
      isDarkMode ? config.colors.dark.connections : config.colors.light.connections
    );

    let lineIndex = 0;

    for (let i = 0; i < config.particles.count; i++) {
      for (let j = i + 1; j < config.particles.count; j++) {
        const dx = particlePositions[i].x - particlePositions[j].x;
        const dy = particlePositions[i].y - particlePositions[j].y;
        const dz = particlePositions[i].z - particlePositions[j].z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < config.particles.connectionDistance) {
          // Add line
          linePositions[lineIndex * 6] = particlePositions[i].x;
          linePositions[lineIndex * 6 + 1] = particlePositions[i].y;
          linePositions[lineIndex * 6 + 2] = particlePositions[i].z;

          linePositions[lineIndex * 6 + 3] = particlePositions[j].x;
          linePositions[lineIndex * 6 + 4] = particlePositions[j].y;
          linePositions[lineIndex * 6 + 5] = particlePositions[j].z;

          // Fade opacity based on distance
          const opacity = 1 - distance / config.particles.connectionDistance;

          lineColors[lineIndex * 6] = connectionColor.r * opacity;
          lineColors[lineIndex * 6 + 1] = connectionColor.g * opacity;
          lineColors[lineIndex * 6 + 2] = connectionColor.b * opacity;

          lineColors[lineIndex * 6 + 3] = connectionColor.r * opacity;
          lineColors[lineIndex * 6 + 4] = connectionColor.g * opacity;
          lineColors[lineIndex * 6 + 5] = connectionColor.b * opacity;

          lineIndex++;
        }
      }
    }

    // Clear unused lines
    for (let i = lineIndex * 6; i < linePositions.length; i++) {
      linePositions[i] = 0;
      lineColors[i] = 0;
    }

    lineSystem.geometry.setDrawRange(0, lineIndex * 2);
    lineSystem.geometry.attributes.position.needsUpdate = true;
    lineSystem.geometry.attributes.color.needsUpdate = true;
  }

  /**
   * Update 3D geometries
   */
  function updateGeometries(time) {
    geometryObjects.forEach((obj) => {
      // Rotate
      obj.mesh.rotation.x += obj.rotationSpeed.x;
      obj.mesh.rotation.y += obj.rotationSpeed.y;
      obj.mesh.rotation.z += obj.rotationSpeed.z;

      // Float
      const floatTime = time * 0.001 * obj.floatSpeed + obj.floatOffset;
      obj.mesh.position.y = obj.initialY + Math.sin(floatTime) * 3;

      // Scroll effect
      obj.mesh.position.z = obj.mesh.position.z + scrollProgress * 0.1;

      // Mouse parallax
      obj.mesh.position.x += (mouse.x * 10 - obj.mesh.position.x) * 0.01;
      obj.mesh.position.y += (mouse.y * 10 - obj.mesh.position.y) * 0.01;
    });
  }

  /**
   * Main animation loop
   */
  function animate(time) {
    if (!isInitialized) return;

    animationFrameId = requestAnimationFrame(animate);

    // Smooth mouse lerping
    mouse.x += (targetMouse.x - mouse.x) * 0.1;
    mouse.y += (targetMouse.y - mouse.y) * 0.1;

    // Update elements
    updateParticles(time);
    updateGeometries(time);

    // Camera parallax
    camera.position.x = mouse.x * config.mouse.parallaxStrength * 10;
    camera.position.y = mouse.y * config.mouse.parallaxStrength * 10;
    camera.lookAt(scene.position);

    // Scroll-based camera movement
    camera.position.z = 50 + scrollProgress * 20;

    // Render
    renderer.render(scene, camera);
  }

  /**
   * Handle mouse movement
   */
  function handleMouseMove(event) {
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  /**
   * Handle scroll
   */
  function handleScroll() {
    const heroRect = heroSection.getBoundingClientRect();
    const heroHeight = heroRect.height;
    const windowHeight = window.innerHeight;

    // Calculate scroll progress through hero section
    if (heroRect.top < windowHeight && heroRect.bottom > 0) {
      scrollProgress = Math.max(0, Math.min(1, -heroRect.top / heroHeight));
    }
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    if (!isInitialized) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Handle dark mode changes
   */
  function handleDarkModeChange() {
    const newDarkMode = document.body.classList.contains('dark-mode');
    if (newDarkMode !== isDarkMode) {
      isDarkMode = newDarkMode;
      updateColors();
    }
  }

  /**
   * Update colors for dark mode
   */
  function updateColors() {
    // Update particle colors
    const particleColors = particleSystem.geometry.attributes.color.array;
    const color = new THREE.Color(isDarkMode ? config.colors.dark.particles : config.colors.light.particles);

    for (let i = 0; i < config.particles.count; i++) {
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    particleSystem.geometry.attributes.color.needsUpdate = true;

    // Update geometry colors
    geometryObjects.forEach(obj => {
      obj.mesh.material.color.setHex(
        isDarkMode ? config.colors.dark.geometries : config.colors.light.geometries
      );
    });
  }

  /**
   * Initialize Intersection Observer for lazy loading
   */
  function initIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isInitialized) {
          // Hero section is visible, initialize Three.js
          initScene();
          animate(0);

          // Start listening to events
          window.addEventListener('mousemove', handleMouseMove, { passive: true });
          window.addEventListener('scroll', handleScroll, { passive: true });
          window.addEventListener('resize', handleResize, { passive: true });

          // Don't disconnect - we want to track visibility
        }
      });
    }, options);

    observer.observe(heroSection);
  }

  /**
   * Cleanup function
   */
  function cleanup() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);

    if (renderer) {
      renderer.dispose();
    }

    // Dispose geometries and materials
    scene?.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }

  /**
   * Initialize
   */
  function init() {
    // Use Intersection Observer for lazy loading
    initIntersectionObserver();

    // Watch for dark mode changes
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => {
        setTimeout(handleDarkModeChange, 100);
      });
    }

    // Watch for dark mode class changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          handleDarkModeChange();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
