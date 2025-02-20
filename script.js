// Variables globales
let score = 0;
let health = 100;
let enemies = [];
let projectiles = [];
let gameLoop;
const tower = document.getElementById('tower');
const gameContainer = document.getElementById('gameContainer');

// Posición inicial de la torre
let towerX = gameContainer.offsetWidth / 2 - 20;
let towerY = gameContainer.offsetHeight - 110;
tower.style.left = towerX + 'px';
tower.style.top = towerY + 'px';

// Mover la torre con las flechas del teclado
document.addEventListener('keydown', (e) => {
    const speed = 10;
    switch (e.key) {
        case 'ArrowUp':
            towerY = Math.max(towerY - speed, 0);
            break;
        case 'ArrowDown':
            towerY = Math.min(towerY + speed, gameContainer.offsetHeight - 60);
            break;
        case 'ArrowLeft':
            towerX = Math.max(towerX - speed, 0);
            break;
        case 'ArrowRight':
            towerX = Math.min(towerX + speed, gameContainer.offsetWidth - 40);
            break;
    }
    tower.style.left = towerX + 'px';
    tower.style.top = towerY + 'px';
});

// Generar enemigos
function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.top = Math.random() * (gameContainer.offsetHeight - 30) + 'px';
    enemy.style.left = gameContainer.offsetWidth + 'px';
    gameContainer.appendChild(enemy);
    enemies.push({
        element: enemy,
        x: gameContainer.offsetWidth,
        y: parseInt(enemy.style.top),
        speed: 2
    });
}

// Mover enemigos
function moveEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].x -= enemies[i].speed;
        enemies[i].element.style.left = enemies[i].x + 'px';

        // Si el enemigo llega al final del mapa
        if (enemies[i].x < 0) {
            enemies[i].element.remove();
            enemies.splice(i, 1);
            health -= 10;
            document.getElementById('healthBar').textContent = 'Health: ' + health;
            if (health <= 0) {
                alert('Game Over! Your score: ' + score);
                clearInterval(gameLoop);
            }
        }
    }
}

// Disparar proyectiles
function shoot() {
    const projectile = document.createElement('div');
    projectile.className = 'projectile';
    projectile.style.left = (towerX + 20) + 'px';
    projectile.style.top = (towerY + 30) + 'px';
    gameContainer.appendChild(projectile);
    projectiles.push({
        element: projectile,
        x: towerX + 20,
        y: towerY + 30
    });
}

// Mover proyectiles y detectar colisiones
function moveProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].x += 5;
        projectiles[i].element.style.left = projectiles[i].x + 'px';

        // Detectar colisiones con enemigos
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (Math.abs(projectiles[i].x - enemies[j].x) < 20 &&
                Math.abs(projectiles[i].y - enemies[j].y) < 20) {
                // Colisión detectada
                enemies[j].element.remove();
                enemies.splice(j, 1);
                projectiles[i].element.remove();
                projectiles.splice(i, 1);
                score += 10;
                document.getElementById('score').textContent = 'Score: ' + score;
                break;
            }
        }

        // Eliminar proyectiles que salen del mapa
        if (projectiles[i] && projectiles[i].x > gameContainer.offsetWidth) {
            projectiles[i].element.remove();
            projectiles.splice(i, 1);
        }
    }
}

// Iniciar el juego
setInterval(shoot, 1000);
gameLoop = setInterval(() => {
    moveEnemies();
    moveProjectiles();
    if (Math.random() < 0.03) {
        spawnEnemy();
    }
}, 50);