let stats = {
    telepathy: { correct: 0, total: 0 },
    zener: { correct: 0, total: 0 },
    color: { correct: 0, total: 0 }
};

function startGame(type) {
    document.getElementById('main-menu').classList.add('hidden');
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.remove('hidden');
    
    // Логика инициализации конкретной игры
    switch(type) {
        case 'telepathy':
            initTelepathyGame();
            break;
        case 'zener':
            initZenerGame();
            break;
        case 'color':
            initColorGame();
            break;
    }
}

function initTelepathyGame() {
    const number = Math.floor(Math.random() * 10) + 1;
    // ... логика игры ...
}

function showStats() {
    const statsText = Object.entries(stats)
        .map(([game, data]) => `
            <div class="stat-item">
                <h3>${game}</h3>
                <p>Правильно: ${data.correct}/${data.total}</p>
                <p>Точность: ${(data.correct/(data.total || 1)*100).toFixed(1)}%</p>
            </div>
        `).join('');
    
    // Показать статистику
}

// Базовая инициализация
window.onload = () => {
    if(localStorage.getItem('stats')) {
        stats = JSON.parse(localStorage.getItem('stats'));
    }
};