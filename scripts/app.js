const tg = window.Telegram?.WebApp;
let stats = JSON.parse(localStorage.getItem('stats')) || {
    telepathy: { correct: 0, total: 0 },
    zener: { correct: 0, total: 0 },
    color: { correct: 0, total: 0 },
    streak: 0
};

const achievements = JSON.parse(localStorage.getItem('achievements')) || {
    novice: { name: "Посвящение", description: "Пройдите 5 испытаний", unlocked: false },
    oracle: { name: "Провидец", description: "10 верных предсказаний подряд", unlocked: false },
    chromaMaster: { name: "Повелитель Цветов", description: "Угадайте 15 цветов", unlocked: false }
};

// Инициализация Telegram WebApp
if (tg) {
    tg.ready();
    tg.expand();
    tg.BackButton.onClick(showMainMenu);
}

function showMainMenu() {
    document.querySelectorAll('.card').forEach(el => el.classList.add('hidden'));
    document.getElementById('main-menu').classList.remove('hidden');
    if (tg) tg.BackButton.hide();
}

function startGame(type) {
    showScreen('game-screen');
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = '';
    
    const answer = generateTask(type);
    console.log(`[ORACULUM] Загадано: ${answer}`);

    switch(type) {
        case 'telepathy':
            gameContent.innerHTML = `
                <h3 class="game-prompt">⌛ Внемлите Числам Судьбы ⌛</h3>
                <div class="number-grid">
                    ${Array.from({length: 10}, (_, i) => `
                        <button class="rune-button" onclick="checkAnswer('telepathy', ${i+1}, ${answer})">
                            ${i+1}
                        </button>
                    `).join('')}
                </div>
            `;
            break;

        case 'zener':
            const symbols = ['🜁', '🜂', '🜄', '🜃', '🜆'];
            gameContent.innerHTML = `
                <h3 class="game-prompt">🜔 Выберите Истинный Символ 🜔</h3>
                <div class="symbol-grid">
                    ${symbols.map(symbol => `
                        <div class="ancient-symbol" onclick="checkAnswer('zener', '${symbol}', '${answer}')">
                            ${symbol}
                        </div>
                    `).join('')}
                </div>
            `;
            break;

        case 'color':
            const colors = ['#8a0303', '#03438a', '#038a0d', '#8a7a03', '#5c038a'];
            gameContent.innerHTML = `
                <h3 class="game-prompt">🝇 Узрите Истинный Цвет 🝇</h3>
                <div class="chroma-grid">
                    ${colors.map(color => `
                        <div class="chroma-orb" 
                             style="background: ${color}" 
                             onclick="checkAnswer('color', '${color}', '${answer}')">
                        </div>
                    `).join('')}
                </div>
            `;
            break;
    }
}

function generateTask(type) {
    const generators = {
        telepathy: () => Math.floor(Math.random() * 10) + 1,
        zener: () => ['🜁', '🜂', '🜄', '🜃', '🜆'][Math.floor(Math.random() * 5)],
        color: () => ['#8a0303', '#03438a', '#038a0d', '#8a7a03', '#5c038a'][Math.floor(Math.random() * 5)]
    };
    return generators[type]();
}

function checkAnswer(type, guess, answer) {
    stats[type].total++;
    
    if (guess === answer) {
        stats[type].correct++;
        stats.streak++;
        showResultMessage(`🜟 Истина Открылась! 🜟`, answer);
    } else {
        stats.streak = 0;
        showResultMessage(`⚰ Завеса Заблуждений... ⚰`, answer);
    }

    checkAchievements();
    saveProgress();
}

function showResultMessage(message, answer) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-card';
    resultDiv.innerHTML = `
        <h4>${message}</h4>
        <div class="revealed-answer">${answer}</div>
    `;
    document.getElementById('game-screen').appendChild(resultDiv);
    setTimeout(() => resultDiv.remove(), 2500);
}

function showStats() {
    showScreen('stats-screen');
    const content = document.getElementById('stats-content');
    content.innerHTML = Object.entries(stats)
        .filter(([key]) => key !== 'streak')
        .map(([type, data]) => `
            <div class="chronicle-item">
                <div class="chronicle-header">${getTypeName(type)}</div>
                <div class="chronicle-progress">
                    <div class="progress-bar" style="width: ${(data.correct / (data.total || 1)) * 100}%"></div>
                </div>
                <div class="chronicle-numbers">
                    ${data.correct} / ${data.total} 
                    (${data.total ? ((data.correct/data.total)*100).toFixed(1) : 0}%)
                </div>
            </div>
        `).join('');
}

function showAchievements() {
    showScreen('achievements-screen');
    const content = document.getElementById('achievements-content');
    content.innerHTML = Object.entries(achievements)
        .map(([key, achievement]) => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.unlocked ? '🜚' : '⚷'}</div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `).join('');
}

function checkAchievements() {
    const unlockList = [];
    
    // Проверка достижений
    if (!achievements.novice.unlocked && getTotalAttempts() >= 5) {
        achievements.novice.unlocked = true;
        unlockList.push(achievements.novice.name);
    }

    if (!achievements.oracle.unlocked && stats.streak >= 10) {
        achievements.oracle.unlocked = true;
        unlockList.push(achievements.oracle.name);
    }

    if (!achievements.chromaMaster.unlocked && stats.color.correct >= 15) {
        achievements.chromaMaster.unlocked = true;
        unlockList.push(achievements.chromaMaster.name);
    }

    // Показ новых достижений
    if (unlockList.length > 0) {
        showUnlockEffect(unlockList);
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }
}

function showUnlockEffect(achievementsList) {
    const effectDiv = document.createElement('div');
    effectDiv.className = 'unlock-effect';
    effectDiv.innerHTML = `
        <div class="unlock-glow"></div>
        <div class="unlock-content">
            <h3>⚔ Признание Сил ⚔</h3>
            <ul>
                ${achievementsList.map(name => `<li>${name}</li>`).join('')}
            </ul>
        </div>
    `;
    document.body.appendChild(effectDiv);
    setTimeout(() => effectDiv.remove(), 3500);
}

function getTypeName(type) {
    const names = {
        telepathy: 'Числовая Магия',
        zener: 'Руны Судьбы', 
        color: 'Хроматический Дар'
    };
    return names[type] || type;
}

function getTotalAttempts() {
    return Object.values(stats).reduce((acc, curr) => 
        acc + (curr.total || 0), 0);
}

function showScreen(screenId) {
    document.querySelectorAll('.card').forEach(el => el.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    if (tg) {
        tg.BackButton.show();
        tg.BackButton.onClick(showMainMenu);
    }
}

function saveProgress() {
    localStorage.setItem('stats', JSON.stringify(stats));
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

function closeApp() {
    if (tg) tg.close();
    else alert('Покиньте Храм через Телеграм');
}

// Инициализация
showMainMenu();