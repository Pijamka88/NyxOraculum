class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createExplosion(x, y, color = '#FFD700') {
        for(let i = 0; i < 30; i++) {
            this.particles.push({
                x, y,
                color,
                size: Math.random() * 4 + 2,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 5 + 2,
                alpha: 1
            });
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => {
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            p.alpha -= 0.03;
            p.speed *= 0.95;

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            return p.alpha > 0;
        });
        requestAnimationFrame(() => this.update());
    }
}

const particles = new ParticleSystem();
particles.update();

let stats = JSON.parse(localStorage.getItem('stats')) || {
    telepathy: { correct: 0, total: 0 },
    zener: { correct: 0, total: 0 },
    color: { correct: 0, total: 0 },
    psi: { time: 0, power: 0 }
};

// Обработчики для взрывов при нажатии кнопок
document.querySelectorAll('.game-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        particles.createExplosion(
            rect.left + rect.width/2,
            rect.top + rect.height/2,
            '#FFD700'
        );
    });
});

// Режим Пси-контроль
let psiBall = null;
let isControlling = false;

function initPsiControl(container) {
    container.innerHTML = `
        <h2>⚡ Контроль энергии ⚡</h2>
        <div class="psi-field">
            <div class="psi-ball"></div>
            <div class="psi-info">
                Энергия: <span id="psi-power">0%</span>
            </div>
        </div>
    `;

    psiBall = document.querySelector('.psi-ball');
    const field = document.querySelector('.psi-field');
    let power = 0;

    const updatePosition = (e) => {
        const rect = field.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;
        
        psiBall.style.left = `${x}%`;
        psiBall.style.top = `${y}%`;
        
        power = Math.min(100, power + 0.5);
        document.getElementById('psi-power').textContent = `${Math.round(power)}%`;
        
        particles.createExplosion(e.clientX, e.clientY, '#4B0082');
    };

    field.addEventListener('mousedown', (e) => {
        isControlling = true;
        updatePosition(e);
    });

    field.addEventListener('mousemove', (e) => {
        if(isControlling) updatePosition(e);
    });

    field.addEventListener('mouseup', () => {
        isControlling = false;
        stats.psi.power = Math.max(stats.psi.power, power);
        stats.psi.time += 1;
        power = 0;
        localStorage.setItem('stats', JSON.stringify(stats));
    });
}

// Обновленная функция startGame
function startGame(type) {
    const content = document.getElementById('game-content');
    content.innerHTML = '';

    if(type === 'psi') {
        initPsiControl(content);
    } else {
        // ... предыдущая реализация других режимов
    }

    document.querySelector('.main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
}

// Остальные функции остаются без изменений