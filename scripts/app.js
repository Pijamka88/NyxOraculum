// Инициализация приложения
const tg = window.Telegram?.WebApp;
let stats = JSON.parse(localStorage.getItem('stats')) || {
    telepathy: { correct: 0, total: 0 },
    zener: { correct: 0, total: 0 },
    color: { correct: 0, total: 0 },
    streak: 0
};

const achievements = JSON.parse(localStorage.getItem('achievements')) || {
    novice: { name: "Новичок", description: "Выполните 5 тестов", unlocked: false },
    streak3: { name: "Серия удач", description: "3 правильных ответа подряд", unlocked: false },
    masterZener: { name: "Мастер Зенера", description: "10 правильных ответов с картами", unlocked: false }
};

// Инициализация Telegram Web App
if (tg) {
    tg.ready();
    tg.expand();
    tg.BackButton.onClick(showMainMenu);
}

// Основные функции
function showMainMenu() {
    document.querySelectorAll('.card').forEach(el => el.classList.add('hidden'));
    document.getElementById('main-menu').classList.remove('hidden');
    if (tg) tg.BackButton.hide();
}

function startGame(type) {
    showScreen('game-screen');
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = '';

    // Генерация задания
    const answer = generateTask(type);
    console.log(`Загаданный ответ (${type}):`, answer); // Для отладки
    
    // Создание интерфейса
    switch(type) {
        case 'telepathy':
            gameContent.innerHTML = `<h3>Угадайте число от 1 до 10</h3>`;
            for (let i = 1; i <= 10; i++) {
                const btn = document.createElement('button');
                btn.className = 'game-button';
                btn.textContent = i;
                btn.onclick = () => checkAnswer(type, i, answer);
                gameContent.appendChild(btn);
            }
            break;

        case 'zener':
            gameContent.innerHTML = `<h3>Выберите загаданный символ</h3>`;
            const symbols = ['○', '□', '～', '✚', '★'];
            const grid = document.createElement('div');
            grid.className = 'symbol-grid';
            symbols.forEach(symbol => {
                const div = document.createElement('div');
                div.className = 'symbol-item';
                div.textContent = symbol;
                div.onclick = () => checkAnswer(type, symbol, answer);
                grid.appendChild(div);
            });
            gameContent.appendChild(grid);
            break;

        case 'color':
            gameContent.innerHTML = `<h3>Выберите загаданный цвет</h3>`;
            const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
            colors.forEach(color => {
                const btn = document.createElement('button');
                btn.className = 'game-button';
                btn.style.backgroundColor = color;
                btn.onclick = () => checkAnswer(type, color, answer);
                gameContent.appendChild(btn);
            });
            break;
    }
}

function generateTask(type) {
    switch(type) {
        case 'telepathy': 
            return Math.floor(Math.random() * 10) + 1;
            
        case 'zener': 
            const zenerSymbols = ['○','□','～','✚','★'];
            return zenerSymbols[Math.floor(Math.random() * zenerSymbols.length)];
            
        case 'color': 
            const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
            return colors[Math.floor(Math.random() * colors.length)];
    }
}

function checkAnswer(type, guess, answer) {
    stats[type].total++;
    
    if (guess === answer) {
        stats[type].correct++;
        stats.streak++;
        showResult(`✅ Верно! Правильный ответ: ${answer}`);
    } else {
        stats.streak = 0;
        showResult(`❌ Неверно. Правильный ответ: ${answer}`);
    }

    checkAchievements();
    saveStats();
}

function showResult(message) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'card';
    resultDiv.innerHTML = `<h3>${message}</h3>`;
    document.getElementById('game-screen').appendChild(resultDiv);
    setTimeout(() => resultDiv.remove(), 2000);
}

function showStats() {
    showScreen('stats-screen');
    const content = document.getElementById('stats-content');
    content.innerHTML = Object.entries(stats)
        .filter(([key]) => key !== 'streak')
        .map(([type, data]) => `
            <div class="stats-item">
                <h4>${type.toUpperCase()}</h4>
                <p>Правильно: ${data.correct}/${data.total}</p>
                <p>Процент: ${data.total ? ((data.correct/data.total)*100).toFixed(1) : 0}%</p>
            </div>
        `).join('');
}

function showAchievements() {
    showScreen('achievements-screen');
    const content = document.getElementById('achievements-content');
    content.innerHTML = Object.entries(achievements)
        .map(([key, achievement]) => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : ''}">
                <h4>${achievement.unlocked ? '🔓' : '🔒'} ${achievement.name}</h4>
                <p>${achievement.description}</p>
            </div>
        `).join('');
}

function checkAchievements() {
    const newAchievements = [];
    
    if (!achievements.novice.unlocked && stats.telepathy.total + stats.zener.total + stats.color.total >= 5) {
        achievements.novice.unlocked = true;
        newAchie