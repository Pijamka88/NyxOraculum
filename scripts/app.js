class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color || '#FFD700';
        this.velocity = {
            x: (Math.random() - 0.5) * 15, // Увеличена скорость
            y: (Math.random() - 0.5) * 15
        };
        this.alpha = 1;
        this.size = Math.random() * 5 + 2; // Увеличен размер
    }

    update(ctx) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.02; // Медленное затухание
        this.velocity.x *= 0.97; // Уменьшено трение
        this.velocity.y *= 0.97;
        this.draw(ctx);
    }
}

class ParticleSystem {
    addParticles(x, y, color) {
        for (let i = 0; i < 30; i++) { // Увеличено количество частиц
            const angle = Math.PI * 2 * (i / 30);
            this.particles.push(new Particle(
                x + Math.cos(angle) * 20, // Начальный радиус
                y + Math.sin(angle) * 20,
                color
            ));
        }
    }
}

// Обработчик клика с улучшенным определением цвета
document.addEventListener('click', (e) => {
    if (e.target.closest('.game-button, .rune-button, .chroma-orb')) {
        const target = e.target.closest('button');
        const style = window.getComputedStyle(target);
        const color = style.backgroundColor !== 'rgba(0, 0, 0, 0)' ? 
            style.backgroundColor : 
            style.borderColor;
        
        particleSystem.addParticles(
            target.offsetLeft + target.offsetWidth/2,
            target.offsetTop + target.offsetHeight/2,
            color
        );
    }
});