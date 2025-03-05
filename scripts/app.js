class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles(x, y, count = 30) {
        for(let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                size: Math.random() * 3 + 1,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 3 + 1,
                alpha: 1,
                color: `hsl(${Math.random() * 60 + 30}, 70%, 50%)`
            });
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => {
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            p.alpha -= 0.02;
            
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

const psi = {
    ball: null,
    energy: 0,
    maxEnergy: 100,
    field: null,
    particles: new ParticleSystem()
};

function startGame(type) {
    document.getElementById('main-menu').classList.add('hidden');
    const container = document.getElementById('game-container');
    container.classList.remove('hidden');
    
    switch(type) {
        case 'psi':
            initPsiControl();
            break;
        // Реализация других режимов
    }
}

function initPsiControl() {
    psi.field = document.querySelector('.psi-field');
    psi.ball = document.createElement('div');
    psi.ball.className = 'psi-ball';
    psi.field.appendChild(psi.ball);
    
    // Обработчики событий
    const handleStart = (e) => {
        psi.isActive = true;
        psi.startX = e.touches ? e.touches[0].clientX : e.clientX;
        psi.startY = e.touches ? e.touches[0].clientY : e.clientY;
    };
    
    const handleMove = (e) => {
        if(!psi.isActive) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        
        psi.energy = Math.min(psi.maxEnergy, psi.energy + 0.5);
        updatePsiDisplay();
        
        // Создание частиц
        psi.particles.createParticles(x, y);
    };
    
    psi.field.addEventListener('touchstart', handleStart);
    psi.field.addEventListener('mousedown', handleStart);
    psi.field.addEventListener('touchmove', handleMove);
    psi.field.addEventListener('mousemove', handleMove);
}

function updatePsiDisplay() {
    document.getElementById('psi-energy').textContent = `${Math.round(psi.energy)}%`;
    document.querySelector('.psi-progress').style.width = `${psi.energy}%`;
}

// Инициализация
window.onload = () => {
    psi.particles.update();
    document.querySelectorAll('.game-button').forEach(btn => {
        btn.addEventListener('click', () => {
            psi.particles.createParticles(
                btn.offsetLeft + btn.offsetWidth/2,
                btn.offsetTop + btn.offsetHeight/2
            );
        });
    });
};