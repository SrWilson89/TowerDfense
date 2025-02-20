// Variables globales
let score = 0;
let health = 100;
let enemies = [];
let projectiles = [];
let powerUps = [];
let gameLoop;
const tower = document.getElementById('tower');
const gameContainer = document.getElementById('gameContainer');

// Propiedades de la torre
let towerX = gameContainer.offsetWidth / 2 - 20;
let towerY = gameContainer.offsetHeight - 110;
tower.style.left = towerX + 'px';
tower.style.top = towerY + 'px';

// Propiedades de los power-ups
let fireRate = 1000; // Velocidad de disparo inicial
let projectileDamage = 10; // Daño inicial de los proyectiles

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

// Generar power-ups
function spawnPowerUp() {
    const powerUp = document.createElement('div');
    powerUp.className = 'powerUp';
    powerUp.style.top = Math.random() * (gameContainer.offsetHeight - 20) + 'px';
    powerUp.style.left = Math.random() * (gameContainer.offsetWidth - 20) + 'px';
    const type = Math.floor(Math.random() * 3); // 0: Velocidad, 1: Daño, 2: Curación
    powerUp.style.backgroundColor = type === 0 ? '#00f' : type === 1 ? '#f00' : '#0f0';
    gameContainer.appendChild(powerUp);
    powerUps.push({
        element: powerUp,
        x: parseInt(powerUp.style.left),
        y: parseInt(powerUp.style.top),
        type: type
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
        y: towerY + 30,
        damage: projectileDamage
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

// Verificar colisiones con power-ups
function checkPowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (Math.abs(towerX - powerUps[i].x) < 30 &&
            Math.abs(towerY - powerUps[i].y) < 30) {
            // Aplicar power-up
            applyPowerUp(powerUps[i].type);
            powerUps[i].element.remove();
            powerUps.splice(i, 1);
        }
    }
}

// Aplicar efectos de power-ups
function applyPowerUp(type) {
    switch (type) {
        case 0: // Velocidad de disparo
            fireRate = 500; // Aumenta la velocidad de disparo
            setTimeout(() => fireRate = 1000, 5000); // Duración: 5 segundos
            break;
        case 1: // Daño mejorado
            projectileDamage = 20; // Aumenta el daño
            setTimeout(() => projectileDamage = 10, 5000); // Duración: 5 segundos
            break;
        case 2: // Curación
            health = Math.min(health + 20, 100); // Restaura 20 de salud
            document.getElementById('healthBar').textContent = 'Health: ' + health;
            break;
    }
}

// Iniciar el juego
setInterval(shoot, fireRate);
gameLoop = setInterval(() => {
    moveEnemies();
    moveProjectiles();
    checkPowerUps();
    if (Math.random() < 0.03) {
        spawnEnemy();
    }
    if (Math.random() < 0.01) {
        spawnPowerUp();
    }
}, 50);