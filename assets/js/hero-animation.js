/**
 * RHIBMS - Three.js & GSAP Hero Section 3D Biomedical Animation
 * Features:
 * 1. Three.js 3D Interactive DNA Double-Helix & Biomedical Molecular Lattice
 * 2. Mouse Parallax & Dynamic Lighting Interaction
 * 3. GSAP Orchestrated Cinematic Intro Sequence & Continuous Float Physics
 * 4. GSAP ScrollTrigger Depth Parallax
 */

(function initHero3DAndGSAP() {
  // Wait for DOM and libraries to be ready
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
      console.warn('Three.js or GSAP not loaded.');
      return;
    }

    /* -------------------------------------------------------------
     * 1. THREE.JS 3D BIOMEDICAL DNA & MOLECULAR PARTICLE FIELD
     * ----------------------------------------------------------- */
    const container = document.getElementById('hero-section');
    const canvas = document.getElementById('hero-three-canvas');

    if (!container || !canvas) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 45;
    camera.position.x = 8; // Offset slightly towards the right for visual balance with text

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 3.5, 80);
    emeraldLight.position.set(20, 15, 20);
    scene.add(emeraldLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 3.0, 80);
    goldLight.position.set(-15, -15, 15);
    scene.add(goldLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2.5, 60);
    cyanLight.position.set(0, 25, 10);
    scene.add(cyanLight);

    // Group for all DNA and molecular structures
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // Position DNA towards right/center for desktop aesthetics
    dnaGroup.position.set(width > 1024 ? 10 : 0, 0, 0);

    /* --- Construct 3D DNA Double-Helix --- */
    const helixLength = 48;
    const strandRadius = 7.5;
    const turns = 2.8;
    const nodeCount = 42;

    // Materials
    const sphereGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const strand1Mat = new THREE.MeshPhongMaterial({
      color: 0x10b981, // Emerald Green
      emissive: 0x064e3b,
      shininess: 90,
      specular: 0x34d399
    });

    const strand2Mat = new THREE.MeshPhongMaterial({
      color: 0xf59e0b, // Amber Gold
      emissive: 0x78350f,
      shininess: 90,
      specular: 0xfde68a
    });

    const bridgeMat = new THREE.MeshPhongMaterial({
      color: 0x38bdf8, // Cyan / Blue connection
      emissive: 0x0c4a6e,
      shininess: 70,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < nodeCount; i++) {
      const t = i / (nodeCount - 1);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * helixLength;

      // Strand 1 node
      const x1 = Math.cos(angle) * strandRadius;
      const z1 = Math.sin(angle) * strandRadius;
      const mesh1 = new THREE.Mesh(sphereGeo, strand1Mat);
      mesh1.position.set(x1, y, z1);
      dnaGroup.add(mesh1);

      // Strand 2 node (180 deg opposite)
      const x2 = Math.cos(angle + Math.PI) * strandRadius;
      const z2 = Math.sin(angle + Math.PI) * strandRadius;
      const mesh2 = new THREE.Mesh(sphereGeo, strand2Mat);
      mesh2.position.set(x2, y, z2);
      dnaGroup.add(mesh2);

      // Connecting Hydrogen Base Pair / Molecular Bridge
      if (i % 2 === 0) {
        const p1 = new THREE.Vector3(x1, y, z1);
        const p2 = new THREE.Vector3(x2, y, z2);
        const distance = p1.distanceTo(p2);
        const bridgeGeo = new THREE.CylinderGeometry(0.12, 0.12, distance, 8);
        const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);

        // Position at midpoint
        bridgeMesh.position.copy(p1).add(p2).multiplyScalar(0.5);
        bridgeMesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          p2.clone().sub(p1).normalize()
        );
        dnaGroup.add(bridgeMesh);
      }
    }

    // Tilt DNA diagonally like textbook medical iconography
    dnaGroup.rotation.z = Math.PI / 6;
    dnaGroup.rotation.x = Math.PI / 10;

    /* --- Floating Biomedical Molecular Particle Dust --- */
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cEmerald = new THREE.Color(0x34d399);
    const cGold = new THREE.Color(0xfbbf24);
    const cCyan = new THREE.Color(0x38bdf8);

    for (let p = 0; p < particleCount; p++) {
      const idx = p * 3;
      positions[idx] = (Math.random() - 0.5) * 80;
      positions[idx + 1] = (Math.random() - 0.5) * 60;
      positions[idx + 2] = (Math.random() - 0.5) * 45;

      const choice = Math.random();
      const col = choice < 0.45 ? cEmerald : choice < 0.8 ? cGold : cCyan;
      colors[idx] = col.r;
      colors[idx + 1] = col.g;
      colors[idx + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite using canvas texture for soft glow
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    const ctx = spriteCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(spriteCanvas);
    const particleMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* --- Mouse Interaction & Smooth Interpolation --- */
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = (x / width - 0.5) * 2;
      mouseY = (y / height - 0.5) * 2;
    }

    container.addEventListener('mousemove', onMouseMove);

    // Resize handler
    function onResize() {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      dnaGroup.position.x = width > 1024 ? 11 : 0;
    }
    window.addEventListener('resize', onResize);

    // Animation Loop
    let clock = new THREE.Clock();

    function animateThree() {
      requestAnimationFrame(animateThree);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous rotation
      dnaGroup.rotation.y += delta * 0.45;

      // Smooth mouse follow
      targetRotY = mouseX * 0.4;
      targetRotX = mouseY * 0.3;
      dnaGroup.rotation.z += (Math.PI / 6 + targetRotX - dnaGroup.rotation.z) * 0.05;
      dnaGroup.position.y = Math.sin(elapsedTime * 1.2) * 1.2;

      // Particle gentle drift
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;

      renderer.render(scene, camera);
    }
    animateThree();

    /* -------------------------------------------------------------
     * 2. GSAP ORCHESTRATION & CINEMATIC HERO ENTRANCE
     * ----------------------------------------------------------- */
    if (typeof gsap !== 'undefined') {
      // Register ScrollTrigger if available
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }

      // Initial state for 3D DNA (GSAP scale entrance)
      dnaGroup.scale.set(0.001, 0.001, 0.001);

      const heroTl = gsap.timeline({
        defaults: { ease: 'power3.out' }
      });

      // 1. Animate Announcement Pill
      heroTl.from('#hero-tag-pill', {
        y: -35,
        opacity: 0,
        duration: 0.85,
        ease: 'back.out(1.8)'
      });

      // 2. Animate 3D DNA Scaling & Spinning in
      heroTl.to(dnaGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.5,
        ease: 'elastic.out(1, 0.6)'
      }, '-=0.5');

      // 3. Animate Hero Headline with smooth stagger
      heroTl.from('#hero-title', {
        y: 50,
        opacity: 0,
        duration: 1.1,
        ease: 'power4.out'
      }, '-=1.2');

      // 4. Animate Hero Description Subtext
      heroTl.from('#hero-desc', {
        y: 30,
        opacity: 0,
        duration: 0.9
      }, '-=0.8');

      // 5. Animate Dual CTA Buttons
      heroTl.from('.hero-cta-btn', {
        y: 20,
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(2)'
      }, '-=0.6');

      // 6. Animate Slider Dots
      heroTl.from('.hero-dot', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1
      }, '-=0.4');

      // 7. Animate Quick Highlight Card on the right
      heroTl.from('#hero-highlight-card', {
        x: 70,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      }, '-=1.0');

      // 8. Stagger feature items within highlight card
      heroTl.from('#hero-highlight-card .hero-feature-item', {
        x: 25,
        opacity: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: 'power2.out'
      }, '-=0.7');

      /* --- GSAP Continuous Floating Physics for Highlight Card --- */
      gsap.to('#hero-highlight-card', {
        y: -10,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      /* --- GSAP ScrollTrigger Depth Parallax --- */
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.to('#hero-three-canvas', {
          scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          },
          y: 120,
          opacity: 0.25,
          ease: 'none'
        });

        gsap.to('.hero-text-content', {
          scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          },
          y: 70,
          opacity: 0.5,
          ease: 'none'
        });

        // Trigger stats counter elevation when scrolled into view
        gsap.from('#stats-section > div', {
          scrollTrigger: {
            trigger: '#stats-section',
            start: 'top 85%'
          },
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out'
        });
      }
    }
  });
})();
