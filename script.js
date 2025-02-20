// Variables globales
let score = 0;
let health = 100;
let enemies = [];
let projectiles = [];
let powerUps = [];
let gameLoop;
const tower = document.getElementById('tower');
const gameContainer = document.getElementById('gameContainer');
const powerUpTimer = document.getElementById('powerUpTimer');
const timerValue = document.getElementById('timerValue');

// Propiedades de la torre
let towerX = gameContainer.offsetWidth / 2 - 20;
let towerY = gameContainer.offsetHeight - 110;
tower.style.left = towerX + 'px';
tower.style.top = towerY + 'px';

// Propiedades de los power-ups
let fireRate = 1000; // Velocidad de disparo inicial
let projectileDamage = 10; // Daño inicial de los proyectiles
let multipleShots = 1; // Número de disparos (1 normal, 3 triple, 5 quíntuple)

// Temporizador de power-up
let powerUpActive = false;
let powerUpEndTime = 0;

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
    const type = Math.floor(Math.random() * 4); // 0: Velocidad, 1: Daño, 2: Curación, 3: Disparo múltiple
    
    // Color según el tipo de power-up
    switch(type) {
        case 0: powerUp.style.backgroundColor = '#00f'; break; // Azul - Velocidad
        case 1: powerUp.style.backgroundColor = '#f00'; break; // Rojo - Daño
        case 2: powerUp.style.backgroundColor = '#0f0'; break; // Verde - Curación
        case 3: powerUp.style.backgroundColor = '#f0f'; break; // Magenta - Disparo múltiple
    }
    
    gameContainer.appendChild(powerUp);
    powerUps.push({
        element: powerUp,
        x: parseInt(powerUp.style.left),
        y: parseInt(powerUp.style.top),
        type: type
    });
}

// Función para crear un proyectil individual
function createProjectile(angleOffset = 0) {
    const projectile = document.createElement('div');
    projectile.className = powerUpActive ? 'projectile powered' : 'projectile';
    projectile.style.left = (towerX + 30) + 'px';
    projectile.style.top = (towerY + 20) + 'px';
    gameContainer.appendChild(projectile);
    
    const angle = (angleOffset * Math.PI) / 180;
    const speed = 5;
    
    projectiles.push({
        element: projectile,
        x: towerX + 30,
        y: towerY + 20,
        damage: projectileDamage,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed
    });
}

// Disparar proyectiles
function shoot() {
    if (multipleShots === 5) {
        // Disparo quíntuple
        createProjectile(0);    // Centro
        createProjectile(-20);  // Arriba lejano
        createProjectile(-10);  // Arriba cercano
        createProjectile(10);   // Abajo cercano
        createProjectile(20);   // Abajo lejano
    } else if (multipleShots === 3) {
        // Disparo triple
        createProjectile(0);    // Centro
        createProjectile(-15);  // Arriba
        createProjectile(15);   // Abajo
    } else {
        // Disparo normal
        createProjectile(0);
    }
}

// Mover proyectiles y detectar colisiones
function moveProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        if (projectiles[i]) {
            projectiles[i].x += projectiles[i].dx;
            projectiles[i].y += projectiles[i].dy;
            projectiles[i].element.style.left = projectiles[i].x + 'px';
            projectiles[i].element.style.top = projectiles[i].y + 'px';

            // Detectar colisiones con enemigos
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (Math.abs(projectiles[i].x - enemies[j].x) < 20 &&
                    Math.abs(projectiles[i].y - enemies[j].y) < 20) {
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
            if (projectiles[i] && (
                projectiles[i].x > gameContainer.offsetWidth ||
                projectiles[i].x < 0 ||
                projectiles[i].y > gameContainer.offsetHeight ||
                projectiles[i].y < 0
            )) {
                projectiles[i].element.remove();
                projectiles.splice(i, 1);
            }
        }
    }
}

// Mover enemigos
function moveEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].x -= enemies[i].speed;
        enemies[i].element.style.left = enemies[i].x + 'px';

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

// Verificar colisiones con power-ups
function checkPowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (Math.abs(towerX - powerUps[i].x) < 30 &&
            Math.abs(towerY - powerUps[i].y) < 30) {
            applyPowerUp(powerUps[i].type);
            powerUps[i].element.remove();
            powerUps.splice(i, 1);
        }
    }
}

// Aplicar efectos de power-ups
function applyPowerUp(type) {
    powerUpActive = true;
    powerUpEndTime = Date.now() + 50000; // 50 segundos para todos los power-ups
    tower.classList.add('powered');

    // Resetear efectos previos
    const resetEffects = () => {
        powerUpActive = false;
        tower.classList.remove('powered');
        powerUpTimer.classList.add('hidden');
        fireRate = 1000;
        projectileDamage = 10;
        multipleShots = 1;
    };

    switch (type) {
        case 0: // Velocidad de disparo
            fireRate = 500;
            setTimeout(resetEffects, 50000);
            break;
        case 1: // Daño mejorado
            projectileDamage = 20;
            setTimeout(resetEffects, 50000);
            break;
        case 2: // Curación
            health = Math.min(health + 40, 100);
            document.getElementById('healthBar').textContent = 'Health: ' + health;
            powerUpActive = false;
            tower.classList.remove('powered');
            break;
        case 3: // Disparo múltiple (nuevo power-up)
            multipleShots = Math.random() < 0.5 ? 3 : 5; // 50% probabilidad de triple o quíntuple
            setTimeout(resetEffects, 50000);
            break;
    }

    if (type !== 2) { // No mostrar temporizador para la curación
        powerUpTimer.classList.remove('hidden');
        updateTimer();
    }
}

// Actualizar el temporizador visual
function updateTimer() {
    if (powerUpActive) {
        const remainingTime = Math.ceil((powerUpEndTime - Date.now()) / 1000);
        timerValue.textContent = remainingTime;
        if (remainingTime > 0) {
            requestAnimationFrame(updateTimer);
        } else {
            powerUpTimer.classList.add('hidden');
        }
    }
}

// Iniciar el juego
setInterval(shoot, fireRate);
gameLoop = setInterval(() => {
    moveEnemies();
    moveProjectiles();
    checkPowerUps();
    if (Math.random() < 0.03) spawnEnemy();
    if (Math.random() < 0.01) spawnPowerUp();
}, 50);