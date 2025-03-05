// Класс для управления частицами
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    // Подгонка размера холста
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Создание взрыва частиц
    createExplosion(x, y, color = '#FFD700', count = 30) {
        for(let i = 0; i < count; i++) {
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

    // Основной цикл анимации
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

// Инициализация системы частиц
const particles = new ParticleSystem();
particles.update();

// Статистика приложения
let stats = JSON.parse(localStorage.getItem('stats')) || {
    telepathy: { correct: 0, total: 0 },
    zener: { correct: 0, total: 0 },
    color: { correct: 0, total: 0 },
    psi: { maxPower: 0, totalTime: 0 }
};

// Глобальные переменные для режима Пси-контроль
let psiBall = null;
let isControlling = false;
let psiPower = 0;
let controlStartTime = 0;

// Обработчики взрывов для кнопок
document.querySelectorAll('.game-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        particles.createExplosion(
            rect.left + rect.width/2,
            rect.top + rect.height/2
        );
    });
});

// Основные функции приложения
function startGame(type) {
    document.querySelector('.main-menu').classList.add('hidden');
    const gameScreen = document.getElementById('game-screen');
    gameScreen.classList.remove('hidden');
    
    const content = document.getElementById('game-content');
    content.innerHTML = '';

    switch(type) {
        case 'telepathy':
            initTelepathyGame(content);
            break;
        case 'zener':
            initZenerGame(content);
            break;
        case 'color':
            initColorGame(content);
            break;
        case 'psi':
            initPsiControl(content);
            break;
    }
}

// Инициализация режима Числовой магии
function initTelepathyGame(container) {
    const target = Math.floor(Math.random() * 10) + 1;
    
    container.innerHTML = `
        <h2>Угадайте число от 1 до 10</h2>
        <div class="number-grid">
            ${Array.from({length: 10}, (_, i) => `
                <button class="game-btn" 
                        onclick="checkAnswer('telepathy', ${i+1}, ${target})">
                    ${i+1}
                </button>
            `).join('')}
        </div>
    `;
}

// Инициализация режима Карты Зенера
function initZenerGame(container) {
    const symbols = ['○', '□', '～', '✚', '★'];
    const target = symbols[Math.floor(Math.random() * symbols.length)];
    
    container.innerHTML = `
        <h2>Выберите загаданный символ</h2>
        <div class="symbol-grid">
            ${symbols.map(s => `
                <div class="symbol-item" onclick="checkAnswer('zener', '${s}', '${target}')">
                    ${s}
                </div>
            `).join('')}
        </div>
    `;
}

// Инициализация режима Цветовой интуиции
function initColorGame(container) {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    const target = colors[Math.floor(Math.random() * colors.length)];
    
    container.innerHTML = `
        <h2>Угадайте загаданный цвет</h2>
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

// Проверка ответов
function checkAnswer(type, guess, answer) {
    stats[type].total++;
    
    if(guess === answer) {
        stats[type].correct++;
        showResult('✅ Верно!');
    } else {
        showResult(`❌ Неверно! Правильно: ${answer}`);
    }
    
    saveStats();
    updateParticles(guess === answer);
}

// Отображение результата
function showResult(message) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-message';
    resultDiv.textContent = message;
    document.getElementById('game-content').appendChild(resultDiv);
    setTimeout(() => resultDiv.remove(), 2000);
}

// Инициализация режима Пси-контроль
function initPsiControl(container) {
    container.innerHTML = `
        <h2>⚡ Контроль энергии ⚡</h2>
        <div class="psi-field">
            <div class="psi-ball"></div>
            <div class="psi-info">
                Мощность: <span id="psi-power">0%</span>
                <div class="progress-bar"></div>
            </div>
        </div>
    `;

    psiBall = document.querySelector('.psi-ball');
    const field = document.querySelector('.psi-field');
    psiPower = 0;
    controlStartTime = Date.now();

    // Обработчики событий
    const startControl = (e) => {
        isControlling = true;
        updatePosition(e);
    };

    const moveControl = (e) => {
        if(isControlling) updatePosition(e);
    };

    const endControl = () => {
        isControlling = false;
        stats.psi.maxPower = Math.max(stats.psi.maxPower, psiPower);
        stats.psi.totalTime += Math.round((Date.now() - controlStartTime) / 1000);
        saveStats();
    };

    // Обновление позиции шара
    const updatePosition = (e) => {
        const rect = field.getBoundingClientRect();
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        
        psiBall.style.left = `${((x - rect.left) / rect.width * 100).toFixed(2)}%`;
        psiBall.style.top = `${((y - rect.top) / rect.height * 100).toFixed(2)}%`;
        
        psiPower = Math.min(100, psiPower + 0.5);
        document.getElementById('psi-power').textContent = `${Math.round(psiPower)}%`;
        
        particles.createExplosion(x, y, '#4B0082', 10);
    };

    // Назначение обработчиков
    field.addEventListener('mousedown', startControl);
    field.addEventListener('mousemove', moveControl);
    field.addEventListener('mouseup', endControl);
    field.addEventListener('touchstart', startControl);
    field.addEventListener('touchmove', moveControl);
    field.addEventListener('touchend', endControl);
}

// Сохранение статистики
function saveStats() {
    localStorage.setItem('stats', JSON.stringify(stats));
}

// Показать статистику
function showStats() {
    document.querySelector('.main-menu').classList.add('hidden');
    const statsScreen = document.getElementById('stats-screen');
    statsScreen.classList.remove('hidden');
    
    const content = document.getElementById('stats-content');
    content.innerHTML = Object.entries(stats)
        .map(([type, data]) => {
            if(type === 'psi') {
                return `
                    <div class="stat-item">
                        <h3>Пси-контроль</h3>
                        <p>Макс. мощность: ${data.maxPower}%</p>
                        <p>Общее время: ${data.totalTime} сек</p>
                    </div>
                `;
            }
            return `
                <div class="stat-item">
                    <h3>${type.toUpperCase()}</h3>
                    <p>Правильно: ${data.correct}/${data.total}</p>
                    <p>Точность: ${data.total ? (data.correct/data.total*100).toFixed(1) : 0}%</p>
                </div>
            `;
        }).join('');
}

// Возврат в главное меню
function showMainMenu() {
    document.querySelectorAll('.card').forEach(el => el.classList.add('hidden'));
    document.querySelector('.main-menu').classList.remove('hidden');
}

// Инициализация при загрузке
window.onload = () => {
    if(!localStorage.getItem('stats')) {
        localStorage.setItem('stats', JSON.stringify(stats));
    }
};