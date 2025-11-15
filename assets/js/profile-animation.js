/**
 * Three.js Profile Animation with Smooth Scroll Interactions
 * Optimized for performance with requestAnimationFrame and lazy loading
 */

(function() {
  'use strict';

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. Profile animation will not run.');
    return;
  }

  // Configuration
  const config = {
    particleCount: 100,
    orbCount: 4,
    ringCount: 3,
    animationSpeed: 0.0005,
    scrollSensitivity: 0.001,
    maxParallax: 0.3
  };

  // Animation state
  let scene, camera, renderer;
  let particles = [];
  let orbs = [];
  let rings = [];
  let animationFrameId;
  let isInitialized = false;
  let scrollProgress = 0;
  let targetScrollProgress = 0;
  let isDarkMode = false;

  // DOM elements
  const canvas = document.getElementById('profile-canvas');
  const profileSection = document.querySelector('.animated-profile-section');

  if (!canvas || !profileSection) {
    console.warn('Profile canvas or section not found');
    return;
  }

  /**
   * Initialize Three.js scene
   */
  function initScene() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer with alpha for transparency
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit to 2x for performance
    renderer.setClearColor(0x000000, 0);

    // Check dark mode
    isDarkMode = document.body.classList.contains('dark-mode');

    // Create particles
    createParticles();

    // Create orbs
    createOrbs();

    // Create rings
    createRings();

    isInitialized = true;
  }

  /**
   * Create floating particles
   */
  function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    const color1 = new THREE.Color(isDarkMode ? 0x3b82f6 : 0x3b82f6);
    const color2 = new THREE.Color(isDarkMode ? 0x8b5cf6 : 0x8b5cf6);

    for (let i = 0; i < config.particleCount; i++) {
      // Random position in sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 2 + Math.random() * 2;

      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      // Gradient color
      const mixRatio = Math.random();
      const color = color1.clone().lerp(color2, mixRatio);
      colors.push(color.r, color.g, color.b);

      // Random size
      sizes.push(Math.random() * 3 + 1);

      // Store initial positions for animation
      particles.push({
        theta: theta,
        phi: phi,
        radius: radius,
        speed: Math.random() * 0.5 + 0.5,
        offset: Math.random() * Math.PI * 2
      });
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: isDarkMode ? 0.7 : 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    points.name = 'particles';
    scene.add(points);
  }

  /**
   * Create floating liquid orbs
   */
  function createOrbs() {
    const orbData = [
      { radius: 0.3, x: 1.5, y: 1.2, speed: 1.0, offset: 0 },
      { radius: 0.25, x: -1.3, y: 1.0, speed: 1.2, offset: Math.PI / 2 },
      { radius: 0.28, x: 1.2, y: -1.1, speed: 0.9, offset: Math.PI },
      { radius: 0.22, x: -1.4, y: -0.9, speed: 1.1, offset: Math.PI * 1.5 }
    ];

    orbData.forEach((data, index) => {
      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: isDarkMode ? 0x3b82f6 : 0x3b82f6,
        transparent: true,
        opacity: 0.3,
        shininess: 100,
        emissive: isDarkMode ? 0x1e40af : 0x3b82f6,
        emissiveIntensity: 0.2
      });

      const orb = new THREE.Mesh(geometry, material);
      orb.position.set(data.x, data.y, 0);

      orbs.push({
        mesh: orb,
        speed: data.speed,
        offset: data.offset,
        initialX: data.x,
        initialY: data.y
      });

      scene.add(orb);
    });

    // Add lights for orbs
    const light1 = new THREE.PointLight(0x3b82f6, 1, 10);
    light1.position.set(2, 2, 2);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x8b5cf6, 1, 10);
    light2.position.set(-2, -2, 2);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
  }

  /**
   * Create rotating rings
   */
  function createRings() {
    const ringData = [
      { radius: 2.0, tube: 0.02, speed: 0.3, tilt: Math.PI / 6 },
      { radius: 2.3, tube: 0.02, speed: -0.4, tilt: Math.PI / 4 },
      { radius: 2.6, tube: 0.02, speed: 0.5, tilt: Math.PI / 3 }
    ];

    ringData.forEach((data, index) => {
      const geometry = new THREE.TorusGeometry(data.radius, data.tube, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: isDarkMode ? 0x3b82f6 : 0x3b82f6,
        transparent: true,
        opacity: 0.2,
        wireframe: false
      });

      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = data.tilt;

      rings.push({
        mesh: ring,
        speed: data.speed,
        tilt: data.tilt
      });

      scene.add(ring);
    });
  }

  /**
   * Animate particles based on scroll
   */
  function animateParticles(time) {
    const particleSystem = scene.getObjectByName('particles');
    if (!particleSystem) return;

    const positions = particleSystem.geometry.attributes.position.array;

    particles.forEach((particle, i) => {
      const i3 = i * 3;

      // Animate based on time and scroll
      const animationTime = time * config.animationSpeed * particle.speed + particle.offset;
      const scrollEffect = scrollProgress * Math.PI * 2;

      const theta = particle.theta + animationTime + scrollEffect * 0.5;
      const phi = particle.phi + Math.sin(animationTime) * 0.3;
      const radius = particle.radius + Math.sin(animationTime * 2) * 0.2;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    });

    particleSystem.geometry.attributes.position.needsUpdate = true;

    // Rotate entire particle system based on scroll
    particleSystem.rotation.y = scrollProgress * Math.PI;
    particleSystem.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.2;
  }

  /**
   * Animate orbs with floating and morphing effect
   */
  function animateOrbs(time) {
    orbs.forEach((orbData, index) => {
      const orb = orbData.mesh;
      const animationTime = time * config.animationSpeed * orbData.speed + orbData.offset;

      // Float and morph
      orb.position.x = orbData.initialX + Math.sin(animationTime) * 0.3;
      orb.position.y = orbData.initialY + Math.cos(animationTime * 1.2) * 0.3;
      orb.position.z = Math.sin(animationTime * 0.8) * 0.2;

      // Scale morphing
      const scale = 1 + Math.sin(animationTime * 2) * 0.1;
      orb.scale.set(scale, scale, scale);

      // Rotation
      orb.rotation.x += 0.01 * orbData.speed;
      orb.rotation.y += 0.015 * orbData.speed;

      // Scroll effect
      orb.position.x += scrollProgress * 0.5 * (index % 2 === 0 ? 1 : -1);
    });
  }

  /**
   * Animate rings
   */
  function animateRings(time) {
    rings.forEach((ringData, index) => {
      const ring = ringData.mesh;

      // Rotate
      ring.rotation.z += ringData.speed * 0.01;

      // Scroll effect - rotate faster
      ring.rotation.z += scrollProgress * 0.1 * ringData.speed;

      // Pulsing scale
      const scale = 1 + Math.sin(time * config.animationSpeed * 2 + index) * 0.05;
      ring.scale.set(scale, scale, scale);

      // Opacity pulsing
      ring.material.opacity = 0.2 + Math.sin(time * config.animationSpeed * 3) * 0.1;
    });
  }

  /**
   * Main animation loop
   */
  function animate(time) {
    if (!isInitialized) return;

    animationFrameId = requestAnimationFrame(animate);

    // Smooth scroll lerping
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.1;

    // Animate elements
    animateParticles(time);
    animateOrbs(time);
    animateRings(time);

    // Subtle camera movement based on scroll
    camera.position.x = Math.sin(scrollProgress * Math.PI) * 0.5;
    camera.position.y = Math.cos(scrollProgress * Math.PI) * 0.3;
    camera.lookAt(scene.position);

    // Render
    renderer.render(scene, camera);
  }

  /**
   * Handle scroll events
   */
  function handleScroll() {
    const rect = profileSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate how much of the section is visible
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    const visibleHeight = Math.min(windowHeight - sectionTop, sectionHeight);

    if (visibleHeight > 0 && sectionTop < windowHeight) {
      // Section is visible
      const scrollPercentage = (windowHeight - sectionTop) / (windowHeight + sectionHeight);
      targetScrollProgress = Math.max(0, Math.min(1, scrollPercentage));
    }
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    if (!isInitialized) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

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

      // Update colors
      updateColors();
    }
  }

  /**
   * Update colors for dark mode
   */
  function updateColors() {
    // Update particle colors
    const particleSystem = scene.getObjectByName('particles');
    if (particleSystem) {
      particleSystem.material.opacity = isDarkMode ? 0.7 : 0.6;
    }

    // Update orb colors
    orbs.forEach(orbData => {
      orbData.mesh.material.emissive.setHex(isDarkMode ? 0x1e40af : 0x3b82f6);
    });
  }

  /**
   * Initialize Intersection Observer for lazy loading
   */
  function initIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isInitialized) {
          // Section is visible, initialize Three.js
          initScene();
          animate(0);

          // Start listening to scroll
          window.addEventListener('scroll', handleScroll, { passive: true });

          // Disconnect observer after initialization
          observer.disconnect();
        }
      });
    }, options);

    observer.observe(profileSection);
  }

  /**
   * Cleanup function
   */
  function cleanup() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

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

    // Handle window resize
    window.addEventListener('resize', handleResize, { passive: true });

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
