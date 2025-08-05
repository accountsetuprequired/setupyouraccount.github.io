document.addEventListener('DOMContentLoaded', () => {
    // --- Canvas Particle Animation ---
    const canvas = document.getElementById('particle-background');
    const contentWrapper = document.querySelector('.content-wrapper');
    const ctx = canvas.getContext('2d');
    let width, height, particles, mouse;

    const PARTICLE_COUNT = 100;
    const BASE_SIZE = 12;
    // Get accent color from CSS variable
    const ACCENT_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    const MOUSE_REPEL_RADIUS = 100;
    
    let scrollY = 0;
    let lastScrollY = 0;
    let scrollVelocity = 0;

    // Object to store drawing functions for different shapes
    const shapeDrawers = {
        circle: (x, y, size) => ctx.arc(x, y, size, 0, Math.PI * 2),
        square: (x, y, size) => ctx.rect(x - size, y - size, size * 2, size * 2),
        triangle: (x, y, size) => {
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size, y + size);
            ctx.lineTo(x - size, y + size);
            ctx.closePath();
        },
        line: (x, y, size) => {
            ctx.moveTo(x - size, y + size);
            ctx.lineTo(x + size, y - size);
        }
    };
    const shapeTypes = Object.keys(shapeDrawers);

    class Particle {
        constructor() {
            this.reset(true); // Initial reset
        }

        // Resets a particle to a new random state, often off-screen
        reset(initial = false) {
            this.z = Math.random() * 0.8 + 0.2;
            this.size = BASE_SIZE * (Math.random() * 0.2 + 0.9);
            this.type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

            if (initial) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
            } else {
                const edge = Math.floor(Math.random() * 4);
                const buffer = this.size * 2;
                switch (edge) {
                    case 0: this.x = -buffer; this.y = Math.random() * height; break;
                    case 1: this.x = width + buffer; this.y = Math.random() * height; break;
                    case 2: this.x = Math.random() * width; this.y = -buffer; break;
                    case 3: this.x = Math.random() * width; this.y = height + buffer; break;
                }
            }
            
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
        }

        update() {
            // Mouse repulsion logic
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_REPEL_RADIUS) {
                const angle = Math.atan2(dy, dx);
                const force = (MOUSE_REPEL_RADIUS - dist) / MOUSE_REPEL_RADIUS;
                this.x += Math.cos(angle) * force * 2;
                this.y += Math.sin(angle) * force * 2;
            }

            // Apply scroll inertia
            this.y -= scrollVelocity * this.z * 0.5;

            // Apply base velocity
            this.x += this.vx * this.z;
            this.y += this.vy * this.z;
            
            // Reset particle if it's way off-screen
            const buffer = this.size * 4;
            if (this.x < -buffer || this.x > width + buffer || this.y < -buffer || this.y > height + buffer) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.strokeStyle = ACCENT_COLOR;
            ctx.lineWidth = 2;
            ctx.globalAlpha = this.z * 0.5;
            const scaledSize = this.size * this.z;
            shapeDrawers[this.type](this.x, this.y, scaledSize);
            ctx.stroke();
        }
    }

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        mouse = { x: -MOUSE_REPEL_RADIUS, y: -MOUSE_REPEL_RADIUS };
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        scrollY = contentWrapper.scrollTop;
        scrollVelocity = scrollY - lastScrollY;
        lastScrollY = scrollY;
        
        for (const particle of particles) {
            particle.update();
            particle.draw();
        }
        
        scrollVelocity *= 0.9;

        requestAnimationFrame(animate);
    }

    init();
    animate();
    window.addEventListener('resize', init);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
});
