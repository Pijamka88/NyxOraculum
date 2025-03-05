// Particle System (остается без изменений)

// Новые переменные для пси-контроля
let psiBall;
let isControlling = false;
let force = 0;
let targetX = 50;
let targetY = 50;
let controlStartTime = 0;
let bestTime = 0;

// Обновленный объект stats
let stats = JSON.parse(localStorage.getItem('stats')) || {
    telepathy: { correct: 0, total: 0 },
    zener: { correct: 0, total: 0 },
    color: { correct: 0, total: 0 },
    psi_control: { best_time: 0, total_sessions: 0 },
    streak: 0
};

// В функцию startGame добавить:
case 'psi_control':
    startPsiControl();
    break;

// Функции пси-контроля
function startPsiControl() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('psi-control-screen').classList.remove('hidden');
    
    psiBall = document.getElementById('psi-ball');
    psiBall.style.left = '50%';
    psiBall.style.top = '50%';
    force = 0;
    controlStartTime = Date.now();
    
    updateProgress(0);
    initControlHandlers();
    gameLoop();
}

function initControlHandlers() {
    const gameField = document.querySelector('.game-field');
    
    // Touch events
    gameField.addEventListener('touchstart', (e) => {
        isControlling = true;
        updateTargetPosition(e.touches[0]);
        e.preventDefault();
    });
    
    gameField.addEventListener('touchmove', (e) => {
        updateTargetPosition(e.touches[0]);
        e.preventDefault();
    });
    
    gameField.addEventListener('touchend', () => {
        endControlSession();
    });

    // Mouse events
    gameField.addEventListener('mousedown', (e) => {
        isControlling = true;
        updateTargetPosition(e);
    });
    
    gameField.addEventListener('mousemove', (e) => {
        if(isControlling) updateTargetPosition(e);
    });
    
    gameField.addEventListener('mouseup', () => {
        endControlSession();
    });
}

function updateTargetPosition(event) {
    const rect = event.target.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width) * 100;
    targetY = ((event.clientY - rect.top) / rect.height) * 100;
    force = Math.min(100, force + 0.5);
    updateProgress(force);
}

function updateProgress(value) {
    document.getElementById('force-value').textContent = `${Math.round(value)}%`;
    document.querySelector('.progress-fill').style.width = `${value}%`;
}

function endControlSession() {
    isControlling = false;
    const sessionTime = (Date.now() - controlStartTime) / 1000;
    if(sessionTime > stats.psi_control.best_time) {
        stats.psi_control.best_time = sessionTime;
        bestTime = sessionTime;
    }
    stats.psi_control.total_sessions++;
    force = 0;
    updateProgress(0);
    saveProgress();
}

function gameLoop() {
    if(isControlling) {
        const currentX = parseFloat(psiBall.style.left);
        const currentY = parseFloat(psiBall.style.top);
        
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        
        psiBall.style.left = currentX + dx * 0.1 + '%';
        psiBall.style.top = currentY + dy * 0.1 + '%';
        
        psiBall.style.transform = `scale(${1 + force/200})`;
    }
    
    requestAnimationFrame(gameLoop);
}

// Обновленная функция showStats
function showStats() {
    const content = document.getElementById('stats-content');
    content.innerHTML = `
        ${Object.entries(stats)
            .filter(([key]) => key !== 'streak')
            .map(([type, data]) => {
                if(type === 'psi_control') {
                    return `
                        <div class="stat-item">
                            <h4>Пси-контроль</h4>
                            <p>Рекорд: ${data.best_time.toFixed(1)} сек</p>
                            <p>Сессий: ${data.total_sessions}</p>
                        </div>
                    `;
                }
                return `
                    <div class="stat-item">
                        <h4>${type.toUpperCase()}</h4>
                        <p>Правильно: ${data.correct}/${data.total}</p>
                        <p>Точность: ${data.total ? (data.correct/data.total*100).toFixed(1) : 0}%</p>
                    </div>
                `;
            }).join('')}
    `;
    // Остальной код функции
}