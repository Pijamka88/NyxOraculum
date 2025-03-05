class Particle {
    constructor(x, y, baseColor) {
        this.x = x;
        this.y = y;
        this.color = this.generateColor(baseColor);
        this.velocity = {
            x: (Math.random() - 0.5) * 25,
            y: (Math.random() - 0.5) * 25
        };
        this.size = Math.random() * 8 + 2;
        this.alpha = 1;
    }

    generateColor(base) {
        const hue = base.h + Math.random() * 40 - 20;
        const sat = Math.min(100, base.s + Math.random() * 20 - 10);
        return `hsla(${hue}, ${sat}%, ${base.l}%, ${this.alpha})`;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(ctx) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.015;
        this.velocity.x *= 0.96;
        this.velocity.y *= 0.96;
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

    addParticles(x, y, color) {
        const hsl = this.rgbToHsl(color);
        for (let i = 0; i < 35; i++) {
            this.particles.push(new Particle(x, y, hsl));
        }
    }

    rgbToHsl(rgbStr) {
        const rgb = rgbStr.match(/\d+/g).map(Number);
        const r = rgb[0]/255, g = rgb[1]/255, b = rgb[2]/255;
        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        let h, s, l = (max + min)/2;

        if(max !== min) {
            const d = max - min;
            s = l > 0.5 ? d/(2 - max - min) : d/(max + min);
            switch(max) {
                case r: h = (g - b)/d + (g < b ? 6 : 0); break;
                case g: h = (b - r)/d + 2; break;
                case b: h = (r - g)/d + 4; break;
            }
            h /= 6;
        }
        return { h: h*360, s: s*100, l: l*100 };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => p.alpha > 0);
        this.particles.forEach(p => p.update(this.ctx));
        requestAnimationFrame(() => this.animate());
    }
}

// Инициализация системы частиц
const particleSystem = new ParticleSystem();
particleSystem.animate();

// Обработчики событий
document.addEventListener('click', (e) => {
    const target = e.target.closest('.game-button, .symbol-item, .chroma-orb');
    if(target) {
        const style = getComputedStyle(target);
        const color = style.backgroundColor !== 'rgba(0, 0, 0, 0)' ? 
            style.backgroundColor : 
            style.borderColor;
            
        const rect = target.getBoundingClientRect();
        particleSystem.addParticles(
            rect.left + rect.width/2,
            rect.top + rect.height/2,
            color
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
    document.getElementById('game-screen').classList.remove('hidden');
    
    const content = document.getElementById('game-content');
    content.innerHTML = '';
    
    switch(type) {
        case 'telepathy':
            const number = Math.floor(Math.random() * 10) + 1;
            content.innerHTML = `
                <h3>Угадайте число от 1 до 10</h3>
                <div class="number-grid">
                    ${Array.from({length: 10}, (_, i) => `
                        <button class="game-button" 
                                onclick="checkAnswer('telepathy', ${i+1}, ${number})">
                            ${i+1}
                        </button>
                    `).join('')}
                </div>
            `;
            break;

        case 'zener':
            const symbols = ['🜁', '🜂', '🜄', '🜃', '🜆'];
            const target = symbols[Math.floor(Math.random() * symbols.length)];
            content.innerHTML = `
                <h3>Выберите истинный символ</h3>
                <div class="symbol-grid">
                    ${symbols.map(s => `
                        <div class="symbol-item" onclick="checkAnswer('zener', '${s}', '${target}')">
                            ${s}
                        </div>
                    `).join('')}
                </div>
            `;
            break;

        case 'color':
            const colors = ['#4dabf7', '#9c36b5', '#f06595', '#69db7c', '#ffd43b'];
            const answer = colors[Math.floor(Math.random() * colors.length)];
            content.innerHTML = `
                <h3>Выберите загаданный цвет</h3>
                <div class="chroma-grid">
                    ${colors.map(c => `
                        <div class="chroma-orb" 
                             style="background: ${c}"
                             onclick="checkAnswer('color', '${c}', '${answer}')">
                        </div>
                    `).join('')}
                </div>
            `;
            break;
    }
}

function checkAnswer(type, guess, answer) {
    stats[type].total++;
    stats[type].correct += guess === answer ? 1 : 0;
    stats.streak = guess === answer ? stats.streak + 1 : 0;

    if(guess === answer) {
        showResult(`✅ Верно! Правильный ответ: ${answer}`);
        checkAchievements();
    } else {
        showResult(`❌ Неверно! Правильный ответ: ${answer}`);
    }
    
    localStorage.setItem('stats', JSON.stringify(stats));
}

// Остальные функции остаются аналогичными предыдущим версиям