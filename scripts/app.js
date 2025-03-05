class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.velocity = {
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5
        };
        this.alpha = 1;
        this.colors = ['#FFD700', '#FFEC8B', '#FFF380'];
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colors[Math.floor(Math.random() * this.colors.length)];
        ctx.fill();
        ctx.restore();
    }

    update(ctx) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.02;
        this.draw(ctx);
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addParticles(x, y) {
        for(let i = 0; i < 25; i++) {
            this.particles.push(new Particle(x, y));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => p.alpha > 0);
        this.particles.forEach(p => p.update(this.ctx));
        requestAnimationFrame(() => this.animate());
    }
}

const particleSystem = new ParticleSystem();
particleSystem.animate();

document.addEventListener('click', (e) => {
    const target = e.target.closest('.game-button, .symbol-item, .chroma-orb');
    if(target) {
        const rect = target.getBoundingClientRect();
        particleSystem.addParticles(
            rect.left + rect.width/2,
            rect.top + rect.height/2
        );
    }
});

// Остальная логика приложения остается без изменений
// (функции startGame, checkAnswer, статистика и достижения)