// ============================================
// SHELTER DOG SPONSORSHIP - THREE.JS + MAIN
// Dynamic gradient background with particles
// ============================================

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  initThreeJS();
  initNavigation();
  initScrollAnimations();
  initSmoothScroll();
});

// ============================================
// THREE.JS DYNAMIC BACKGROUND
// ============================================
function initThreeJS() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  // Scene setup
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 50;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Gradient Background Shader
  const gradientGeometry = new THREE.PlaneGeometry(200, 200);
  const gradientMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#FFE5D9') },
      uColor2: { value: new THREE.Color('#FFCAD4') },
      uColor3: { value: new THREE.Color('#F9DCC4') },
      uColor4: { value: new THREE.Color('#FEC89A') }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform vec3 uColor4;
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        
        // Animate gradient position
        float t = uTime * 0.1;
        float x = uv.x + sin(t) * 0.1;
        float y = uv.y + cos(t * 0.7) * 0.1;
        
        // Create smooth gradient blend
        vec3 color1 = mix(uColor1, uColor2, smoothstep(0.0, 0.5, x + sin(t * 0.5) * 0.2));
        vec3 color2 = mix(uColor3, uColor4, smoothstep(0.0, 0.5, y + cos(t * 0.3) * 0.2));
        vec3 finalColor = mix(color1, color2, smoothstep(0.3, 0.7, (x + y) * 0.5));
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.DoubleSide
  });

  // Apply page-specific theme colors to shader
  const body = document.body;
  const themeColors = {
    'theme-spa': ['#B2AC88', '#FFFDD0', '#FFFDD0', '#E2725B'],
    'theme-dayout': ['#87CEEB', '#FFB347', '#F9F9F9', '#87CEEB'],
    'theme-packages': ['#008080', '#FF8C94', '#E1E8ED', '#008080']
  };

  for (const [cls, colors] of Object.entries(themeColors)) {
    if (body.classList.contains(cls)) {
      gradientMaterial.uniforms.uColor1.value.set(colors[0]);
      gradientMaterial.uniforms.uColor2.value.set(colors[1]);
      gradientMaterial.uniforms.uColor3.value.set(colors[2]);
      gradientMaterial.uniforms.uColor4.value.set(colors[3]);
      break;
    }
  }

  const gradientPlane = new THREE.Mesh(gradientGeometry, gradientMaterial);
  gradientPlane.position.z = -50;
  scene.add(gradientPlane);

  // Floating Particles
  const particlesCount = 100;
  const positions = new Float32Array(particlesCount * 3);
  const scales = new Float32Array(particlesCount);
  const speeds = new Float32Array(particlesCount);
  const offsets = new Float32Array(particlesCount);

  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    scales[i] = Math.random() * 0.5 + 0.5;
    speeds[i] = Math.random() * 0.5 + 0.2;
    offsets[i] = Math.random() * Math.PI * 2;
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  particlesGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
  particlesGeometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));

  // Custom particle shader for hearts/circles
  const particlesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 80 },
      uColor1: { value: new THREE.Color('#E8A854') },
      uColor2: { value: new THREE.Color('#E8857C') }
    },
    vertexShader: `
      attribute float aScale;
      attribute float aSpeed;
      attribute float aOffset;
      
      uniform float uTime;
      uniform float uSize;
      
      varying float vAlpha;
      varying float vColorMix;
      
      void main() {
        vec3 pos = position;
        
        // Floating animation
        pos.y += sin(uTime * aSpeed + aOffset) * 3.0;
        pos.x += cos(uTime * aSpeed * 0.7 + aOffset) * 2.0;
        
        vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        
        gl_Position = projectedPosition;
        gl_PointSize = uSize * aScale * (1.0 / -viewPosition.z);
        
        vAlpha = 0.3 + sin(uTime * aSpeed + aOffset) * 0.2;
        vColorMix = aScale;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      
      varying float vAlpha;
      varying float vColorMix;
      
      void main() {
        // Create soft circle
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;
        vec3 color = mix(uColor1, uColor2, vColorMix);
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  // Floating Hearts (3D objects)
  const hearts = [];
  const heartShape = new THREE.Shape();
  const x = 0, y = 0;
  heartShape.moveTo(x + 0.5, y + 0.5);
  heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
  heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
  heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
  heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
  heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
  heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

  const heartGeometry = new THREE.ShapeGeometry(heartShape);

  for (let i = 0; i < 15; i++) {
    const heartMaterial = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xE8A854 : 0xE8857C,
      transparent: true,
      opacity: 0.15 + Math.random() * 0.15,
      side: THREE.DoubleSide
    });

    const heart = new THREE.Mesh(heartGeometry, heartMaterial);
    heart.position.x = (Math.random() - 0.5) * 80;
    heart.position.y = (Math.random() - 0.5) * 80;
    heart.position.z = (Math.random() - 0.5) * 20 - 10;
    heart.rotation.z = Math.PI;
    heart.scale.setScalar(Math.random() * 1.5 + 0.5);

    heart.userData = {
      speed: Math.random() * 0.3 + 0.1,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      floatOffset: Math.random() * Math.PI * 2
    };

    scene.add(heart);
    hearts.push(heart);
  }

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Scroll interaction
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Update gradient
    gradientMaterial.uniforms.uTime.value = elapsedTime;

    // Update particles
    particlesMaterial.uniforms.uTime.value = elapsedTime;

    // Animate hearts
    hearts.forEach((heart) => {
      heart.position.y += Math.sin(elapsedTime * heart.userData.speed + heart.userData.floatOffset) * 0.02;
      heart.position.x += Math.cos(elapsedTime * heart.userData.speed * 0.7 + heart.userData.floatOffset) * 0.01;
      heart.rotation.z += heart.userData.rotSpeed;
    });

    // Mouse parallax
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;

    // Scroll effect
    gradientPlane.position.y = scrollY * 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
      });
    });
  }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  // Animated counters
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element) {
  const targetValue = element.dataset.count;
  if (!targetValue || isNaN(parseInt(targetValue))) return;

  const target = parseInt(targetValue);
  const duration = 2000;
  const start = performance.now();
  const startValue = 0;

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(startValue + (target - startValue) * easeOutQuart);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString();
      if (element.dataset.suffix) {
        element.textContent += element.dataset.suffix;
      }
    }
  }

  requestAnimationFrame(update);
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================
// DOG PROFILE FILTER
// ============================================
function initDogFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const dogCards = document.querySelectorAll('.dog-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      dogCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
          card.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ============================================
// DONATION CARD SELECTION
// ============================================
function initDonationCards() {
  const donationCards = document.querySelectorAll('.donation-card');

  donationCards.forEach(card => {
    card.addEventListener('click', () => {
      donationCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

// ============================================
// IMAGE CAROUSEL
// ============================================
class Carousel {
  constructor(container) {
    this.container = container;
    this.slides = container.querySelectorAll('.carousel-slide');
    this.currentIndex = 0;
    this.autoplayInterval = null;

    this.init();
  }

  init() {
    this.createDots();
    this.startAutoplay();

    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.stopAutoplay());
    this.container.addEventListener('mouseleave', () => this.startAutoplay());
  }

  createDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';

    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
      dot.addEventListener('click', () => this.goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    this.container.appendChild(dotsContainer);
    this.dots = dotsContainer.querySelectorAll('.carousel-dot');
  }

  goToSlide(index) {
    this.slides[this.currentIndex].classList.remove('active');
    this.dots[this.currentIndex].classList.remove('active');

    this.currentIndex = index;

    this.slides[this.currentIndex].classList.add('active');
    this.dots[this.currentIndex].classList.add('active');
  }

  next() {
    const nextIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => this.next(), 5000);
  }

  stopAutoplay() {
    clearInterval(this.autoplayInterval);
  }
}

// Initialize carousels when needed
document.querySelectorAll('.carousel').forEach(carousel => {
  new Carousel(carousel);
});
