// ===== Three.js Background =====
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Colors
const colors = {
    coral: 0xFF7F7F,
    pink: 0xFFB6C1,
    softPink: 0xFFD1DC,
    lightPink: 0xFFE4E8
};

// Create floating shapes
const shapes = [];
const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.TorusGeometry(0.7, 0.3, 16, 100),
    new THREE.SphereGeometry(0.8, 32, 32),
    new THREE.TetrahedronGeometry(1, 0)
];

const colorArray = Object.values(colors);

for (let i = 0; i < 25; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshPhongMaterial({
        color: colorArray[Math.floor(Math.random() * colorArray.length)],
        transparent: true,
        opacity: 0.6,
        shininess: 100
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.x = (Math.random() - 0.5) * 30;
    mesh.position.y = (Math.random() - 0.5) * 30;
    mesh.position.z = (Math.random() - 0.5) * 20 - 10;
    
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    const scale = Math.random() * 0.5 + 0.3;
    mesh.scale.set(scale, scale, scale);
    
    mesh.userData = {
        rotationSpeedX: (Math.random() - 0.5) * 0.01,
        rotationSpeedY: (Math.random() - 0.5) * 0.01,
        floatSpeed: Math.random() * 0.005 + 0.002,
        floatOffset: Math.random() * Math.PI * 2,
        originalY: mesh.position.y
    };
    
    shapes.push(mesh);
    scene.add(mesh);
}

// Create particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 50;
    positions[i + 1] = (Math.random() - 0.5) * 50;
    positions[i + 2] = (Math.random() - 0.5) * 30 - 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
    color: colors.coral,
    size: 0.1,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Lighting
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(colors.coral, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(colors.pink, 0.8, 100);
pointLight2.position.set(-10, -10, 5);
scene.add(pointLight2);

camera.position.z = 15;

// Mouse movement effect
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Animation
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    targetX += (mouseX - targetX) * 0.02;
    targetY += (mouseY - targetY) * 0.02;
    
    shapes.forEach((shape, index) => {
        shape.rotation.x += shape.userData.rotationSpeedX;
        shape.rotation.y += shape.userData.rotationSpeedY;
        shape.position.y = shape.userData.originalY + Math.sin(time + shape.userData.floatOffset) * 0.5;
    });
    
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;
    
    camera.position.x += (targetX * 2 - camera.position.x) * 0.05;
    camera.position.y += (targetY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== Navigation =====
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ===== Typewriter Effect =====
const typewriterTexts = [
    "Singer 🎤",
    "Swimmer 🏊‍♀️",
    "Volunteer 🤝",
    "Gamer 🎮",
    "Explorer 🌍",
    "Dog Lover 🐕"
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingElement = document.querySelector('.typing-text');

function typeWriter() {
    const currentText = typewriterTexts[textIndex];
    
    if (isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }
    
    let typeSpeed = isDeleting ? 50 : 100;
    
    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typewriterTexts.length;
        typeSpeed = 500;
    }
    
    setTimeout(typeWriter, typeSpeed);
}

typeWriter();

// ===== Carousel =====
const carouselTrack = document.querySelector('.carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const dotsContainer = document.querySelector('.carousel-dots');
const cards = document.querySelectorAll('.achievement-card');

let currentIndex = 0;
const totalCards = cards.length;

// Create dots
cards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.carousel-dot');

function updateCarousel() {
    carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateCarousel();
}

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Auto-play carousel
let autoPlayInterval = setInterval(nextSlide, 5000);

// Pause on hover
const carouselContainer = document.querySelector('.carousel-container');
carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
carouselContainer.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(nextSlide, 5000);
});

// Touch support for carousel
let touchStartX = 0;
let touchEndX = 0;

carouselContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

carouselContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
}

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add animation class to elements
document.querySelectorAll('.hobby-card, .travel-card, .service-card, .pet-card').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
});

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Navbar scroll effect =====
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.9)';
        navbar.style.boxShadow = '0 4px 20px rgba(255, 127, 127, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.25)';
        navbar.style.boxShadow = 'none';
    }
    lastScrollY = window.scrollY;
});

console.log('✨ Vanshika\'s Portfolio loaded successfully!');
