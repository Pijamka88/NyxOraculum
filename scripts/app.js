// Particle System
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color || '#FFD700';
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.size = Math.random() * 3 + 1;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update(ctx) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.03;
        this.velocity.x *= 0.96;
        this.velocity.y *= 0.96;
        this.draw(ctx);
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => p.alpha > 0);
        this.particles.forEach(p => p.update(this.ctx));
        requestAnimationFrame(() => this.update());
    }
}

// Инициализация системы частиц
const particleSystem = new ParticleSystem();
particleSystem.update();

// Обработчик клика для всех кнопок
document.addEventListener('click', (e) => {
    if (e.target.closest('.game-button, .rune-button, .chroma-orb')) {
        const rect = e.target.getBoundingClientRect();
        const color = window.getComputedStyle(e.target).borderColor;
        particleSystem.addParticles(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            color || '#FFD700'
        );
    }
});

// Остальной код приложения остается без изменений
// (функции startGame, checkAnswer, showStats и т.д.)