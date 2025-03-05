let stats = JSON.parse(localStorage.getItem('stats')) || {
    telepathy: { correct: 0, total: 0 },
    zener: { correct: 0, total: 0 },
    color: { correct: 0, total: 0 }
};

function startGame(type) {
    document.querySelector('.main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    const content = document.getElementById('game-content');
    content.innerHTML = '';

    switch(type) {
        case 'telepathy':
            initNumberGame(content);
            break;
        case 'zener':
            initSymbolGame(content);
            break;
        case 'color':
            initColorGame(content);
            break;
    }
}

function initNumberGame(container) {
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

function initSymbolGame(container) {
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

function checkAnswer(type, guess, answer) {
    stats[type].total++;
    
    if(guess === answer) {
        stats[type].correct++;
        showResult('✅ Верно!');
    } else {
        showResult(`❌ Неверно! Правильно: ${answer}`);
    }
    
    localStorage.setItem('stats', JSON.stringify(stats));
}

function showResult(message) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result';
    resultDiv.textContent = message;
    document.getElementById('game-content').appendChild(resultDiv);
    setTimeout(() => resultDiv.remove(), 2000);
}

function showStats() {
    document.querySelector('.main-menu').classList.add('hidden');
    const statsScreen = document.getElementById('stats-screen');
    statsScreen.classList.remove('hidden');
    
    const content = document.getElementById('stats-content');
    content.innerHTML = Object.entries(stats)
        .map(([type, data]) => `
            <div class="stat-item">
                <h3>${type.toUpperCase()}</h3>
                <p>Правильно: ${data.correct}/${data.total}</p>
                <p>Точность: ${data.total ? (data.correct/data.total*100).toFixed(1) : 0}%</p>
            </div>
        `).join('');
}

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