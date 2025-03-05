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
        this.alpha -= 0.015;
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
        for(let i = 0; i < 20; i++) {
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
    const target = e.target.closest('.game-button, .symbol-item, .color-item');
    if(target) {
        const rect = target.getBoundingClientRect();
        particleSystem.addParticles(
            rect.left + rect.width/2,
            rect.top + rect.height/2
        );
    }
});

let stats = JSON.parse(localStorage.getItem('stats')) || {
    telepathy: { correct: 0, total: 0 },
    zener: { correct: 0, total: 0 },
    color: { correct: 0, total: 0 },
    streak: 0
};

const achievements = JSON.parse(localStorage.getItem('achievements')) || {
    novice: { name: "Посвящение", desc: "5 завершенных тестов", unlocked: false },
    master: { name: "Провидец", desc: "15 верных ответов подряд", unlocked: false },
    chroma: { name: "Хромакс", desc: "Угадайте 20 цветов", unlocked: false }
};

function startGame(type) {
    document.getElementById('main-menu').classList.add('hidden');
    const gameScreen = document.getElementById('game-screen');
    gameScreen.classList.remove('hidden');
    const content = document.getElementById('game-content');
    content.innerHTML = '';

    switch(type) {
        case 'telepathy':
            generateNumbersGame(content);
            break;
            
        case 'zener':
            generateZenerGame(content);
            break;
            
        case 'color':
            generateColorGame(content);
            break;
    }
}

function generateNumbersGame(container) {
    const target = Math.floor(Math.random() * 10) + 1;
    container.innerHTML = `
        <h3>Угадайте число от 1 до 10</h3>
        <div class="number-grid">
            ${Array.from({length: 10}, (_, i) => `
                <button class="game-button" 
                        onclick="checkAnswer('telepathy', ${i+1}, ${target})">
                    ${i+1}
                </button>
            `).join('')}
        </div>
    `;
}

function generateZenerGame(container) {
    const symbols = ['○', '□', '～', '✚', '★'];
    const target = symbols[Math.floor(Math.random() * symbols.length)];
    container.innerHTML = `
        <h3>Выберите истинный символ</h3>
        <div class="symbol-grid">
            ${symbols.map(s => `
                <div class="symbol-item" onclick="checkAnswer('zener', '${s}', '${target}')">
                    ${s}
                </div>
            `).join('')}
        </div>
    `;
}

function generateColorGame(container) {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    const target = colors[Math.floor(Math.random() * colors.length)];
    container.innerHTML = `
        <h3>Выберите загаданный цвет</h3>
        <div class="color-grid">
            ${colors.map(c => `
                <div class="color-item" 
                     style="background: ${c}"
                     onclick="checkAnswer('color', '${c}', '${target}')">
                </div>
            `).join('')}
        </div>
    `;
}

function checkAnswer(type, guess, answer) {
    stats[type].total++;
    
    if(guess === answer) {
        stats[type].correct++;
        stats.streak++;
        showResult(`✅ Верно! Правильный ответ: ${answer}`);
    } else {
        stats.streak = 0;
        showResult(`❌ Неверно! Правильный ответ: ${answer}`);
    }
    
    checkAchievements();
    localStorage.setItem('stats', JSON.stringify(stats));
}

function showResult(message) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-card';
    resultDiv.textContent = message;
    document.getElementById('game-screen').appendChild(resultDiv);
    setTimeout(() => resultDiv.remove(), 2000);
}

function showStats() {
    document.querySelectorAll('.card').forEach(el => el.classList.add('hidden'));
    document.getElementById('stats-screen').classList.remove('hidden');
    const content = document.getElementById('stats-content');
    content.innerHTML = Object.entries(stats)
        .filter(([key]) => key !== 'streak')
        .map(([type, data]) => `
            <div class="stat-item">
                <h4>${type.toUpperCase()}</h4>
                <p>Правильно: ${data.correct}/${data.total}</p>
                <p>Точность: ${data.total ? (data.correct/data.total*100).toFixed(1) : 0}%</p>
            </div>
        `).join('');
}

window.onload = () => {
    document.querySelector('.animated-bg').style.backgroundSize = '400% 400%';
    document.getElementById('main-menu').classList.remove('hidden');
};