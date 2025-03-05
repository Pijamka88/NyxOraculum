const achievements = {
    novice: { 
        name: "Новичок", 
        condition: (stats) => stats.total >= 5,
        unlocked: false
    },
    streak: {
        name: "Серия",
        condition: (stats) => stats.streak >= 3,
        unlocked: false
    },
    master: {
        name: "Мастер Зенера",
        condition: (stats) => stats.zener.correct >= 10,
        unlocked: false
    }
};

function checkAchievements() {
    let unlocked = [];
    
    for(const [key, achievement] of Object.entries(achievements)) {
        if(!achievement.unlocked && achievement.condition(stats)) {
            achievement.unlocked = true;
            unlocked.push(achievement.name);
            showAchievementPopup(achievement.name);
        }
    }
    
    if(unlocked.length > 0) {
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }
}

function showAchievementPopup(name) {
    const popup = document.createElement('div');
    popup.className = 'card';
    popup.innerHTML = `
        <h3>🎉 Достижение разблокировано!</h3>
        <p>${name}</p>
    `;
    popup.style.animation = 'fadeIn 0.5s';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

// Обновляем при каждом успешном ответе
if(guess === answer) {
    stats.streak = (stats.streak || 0) + 1;
    checkAchievements();
} else {
    stats.streak = 0;
}