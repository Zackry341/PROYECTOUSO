import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { metadata as rows } from '/components/map.js';
import { player, position } from '/components/Player.js';
import { renderer, animate } from './main.js';

const resultDOM = document.getElementById('result-container');
const finalScoreDOM = document.getElementById('final-score');

export function hitTest() {
    const row = rows[position.currentRow - 1];
    if (!row) return;

    // Detectar colisión con vehículos
    if (row.type === 'car' || row.type === 'truck') {
        const playerBoundingBox = new THREE.Box3();
        playerBoundingBox.setFromObject(player);

        row.vehicles.forEach(({ ref }) => {
            if (!ref) throw Error('Vehicle reference is missing');

            const vehicleBoundingBox = new THREE.Box3();
            vehicleBoundingBox.setFromObject(ref);

            if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
                gameOver();
            }
        });
    }

    // Detectar cuando llega al pasto (zona segura)
    if (row.type === 'forest' && position.currentRow > 1) {
        showRewardButton();
    } else {
        hideRewardButton();
    }
}

// Función para mostrar el botón de recompensa
function showRewardButton() {
    let rewardButton = document.getElementById('reward-button');
    
    if (!rewardButton) {
        rewardButton = document.createElement('button');
        rewardButton.id = 'reward-button';
        rewardButton.innerHTML = `
            <i class="fa fa-coins"></i>
            <span>Reclamar Recompensa</span>
        `;
        rewardButton.className = 'reward-btn';
        document.body.appendChild(rewardButton);
        
        rewardButton.addEventListener('click', claimReward);
    }
    
    rewardButton.style.display = 'block';
}

// Función para ocultar el botón de recompensa
function hideRewardButton() {
    const rewardButton = document.getElementById('reward-button');
    if (rewardButton) {
        rewardButton.style.display = 'none';
    }
}

// Función para reclamar recompensa
async function claimReward() {
    const currentScore = position.currentRow;
    const currentBet = window.getCurrentBet ? window.getCurrentBet() : 30;
    
    // Obtener dificultad actual
    const difficulty = window.currentUserDifficulty || 1;
    
    try {
        const response = await fetch('/api/credits/claim-reward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                score: currentScore,
                bet: currentBet,
                difficulty: difficulty // ✅ AGREGAR
            })
        });

        const data = await response.json();
        
        if (data.success) {
            endGameWithReward(data);
            
            if (window.updateCredits) {
                window.updateCredits(data.newBalance);
            }
            
            // ✅ CAMBIAR: Guardar score con dificultad
            saveScore(currentScore, difficulty);
        } else {
            console.error('Error al reclamar recompensa:', data.message);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

function endGameWithReward(rewardData) {
    // Detener el juego
    if (window.renderer && window.renderer.setAnimationLoop) {
        window.renderer.setAnimationLoop(null);
    }
    
    // Ocultar botón de recompensa
    hideRewardButton();
    
    // Mostrar modal de recompensa
    showRewardModal(rewardData);
}

// Función cuando el juego termina (colisión)
async function gameOver() {
    const finalScore = position.currentRow;
    const difficulty = window.currentUserDifficulty || 1;
    
    if (resultDOM && finalScoreDOM) {
        resultDOM.style.visibility = 'visible';
        finalScoreDOM.innerText = finalScore.toString();
    }

    if (window.renderer && window.renderer.setAnimationLoop) {
        window.renderer.setAnimationLoop(null);
    }

    // ✅ CAMBIAR: Guardar score con dificultad
    saveScore(finalScore, difficulty);
    
    hideRewardButton();
}

// Función para mostrar modal de recompensa
function showRewardModal(data) {
    let modal = document.getElementById('reward-modal');
    
    // ✅ Crear modal solo si no existe
    if (!modal) {
        modal = createRewardModal();
    }
    
    // ✅ Verificar que los elementos existan antes de actualizar
    const scoreElement = document.getElementById('reward-score');
    const betElement = document.getElementById('reward-bet');
    const difficultyElement = document.getElementById('reward-difficulty');
    const multiplierElement = document.getElementById('reward-multiplier');
    const creditsElement = document.getElementById('reward-credits');
    const balanceElement = document.getElementById('reward-new-balance');
    
    if (scoreElement) scoreElement.textContent = data.score;
    if (betElement) betElement.textContent = data.bet.toLocaleString();
    if (difficultyElement) difficultyElement.textContent = getDifficultyName(data.difficulty);
    if (multiplierElement) multiplierElement.textContent = `x${data.multiplier}`;
    if (creditsElement) creditsElement.textContent = data.creditsEarned.toLocaleString();
    if (balanceElement) balanceElement.textContent = data.newBalance.toLocaleString();
    
    // Mostrar modal
    modal.style.display = 'block';
}

// Función para crear el modal de recompensa
function createRewardModal() {
    const modal = document.createElement('div');
    modal.id = 'reward-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content reward-content">
            <h2>🎉 ¡Recompensa Obtenida! 🎉</h2>
            <div class="reward-details">
                <div class="reward-item">
                    <span class="label">Puntuación Alcanzada:</span>
                    <span id="reward-score" class="value">0</span>
                </div>
                <div class="reward-item">
                    <span class="label">Apuesta Realizada:</span>
                    <span id="reward-bet" class="value">0</span>
                </div>
                <div class="reward-item">
                    <span class="label">Dificultad:</span>
                    <span id="reward-difficulty" class="value">Fácil</span>
                </div>
                <div class="reward-item">
                    <span class="label">Multiplicador:</span>
                    <span id="reward-multiplier" class="value">x1.5</span>
                </div>
                <div class="reward-item highlight">
                    <span class="label">💰 Créditos Ganados:</span>
                    <span id="reward-credits" class="value gold">0</span>
                </div>
                <div class="reward-item">
                    <span class="label">Nuevo Balance:</span>
                    <span id="reward-new-balance" class="value">0</span>
                </div>
            </div>
            <div class="reward-buttons">
                <button id="back-to-menu-reward" class="btn primary">Volver al Menú</button>
            </div>
        </div>
    `;
    
    // ✅ PRIMERO agregar al DOM
    document.body.appendChild(modal);
    
    // ✅ DESPUÉS agregar event listeners con verificación
    const backToMenuBtn = document.getElementById('back-to-menu-reward');
    const playAgainBtn = document.getElementById('play-again-reward');
    
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            // Volver al menú principal
            const mainMenuModal = document.getElementById('main-menu-modal');
            if (mainMenuModal) {
                mainMenuModal.classList.remove('hidden');
            }
        });
    }
    
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            // Reiniciar el juego
            const mainMenuModal = document.getElementById('main-menu-modal');
            if (mainMenuModal) {
                mainMenuModal.classList.add('hidden');
            }
            if (typeof initializeGame === 'function') {
                initializeGame();
            }
        });
    }
    
    return modal;
}

function getDifficultyName(difficulty) {
    switch(difficulty) {
        case 1: return 'Fácil';
        case 2: return 'Medio';
        case 3: return 'Difícil';
        default: return 'Fácil';
    }
}

// Función para guardar el puntaje automáticamente
async function saveScore(score, difficulty = null) {
    try {
        if (difficulty === null) {
            difficulty = window.currentUserDifficulty || 1;
        }

        // ✅ CORREGIR: Usar el endpoint correcto del router
        const response = await fetch('/api/scoreboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                score: score,
                difficulty: difficulty // ✅ AGREGAR
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('Puntaje guardado correctamente');
            console.log(`Score original: ${data.originalScore}, Score final: ${data.finalScore}, Multiplicador: x${data.multiplier}`);
            
            if (window.updateBestScore) {
                window.updateBestScore(data.finalScore);
            }
            
            showScoreMessage(data, score);
        } else {
            console.error('Error al guardar puntaje:', data.message);
            showErrorMessage('Error al guardar puntaje: ' + data.message);
        }
    } catch (error) {
        console.error('Error de conexión al guardar puntaje:', error);
        showErrorMessage('Error de conexión al guardar puntaje');
    }
}


// Función para mostrar mensaje de puntaje
function showScoreMessage(data, originalScore) {
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 25px;
        border-radius: 15px;
        font-size: 16px;
        z-index: 10000;
        text-align: center;
        border: 2px solid ${data.isNewRecord ? '#FFD700' : '#4CAF50'};
    `;
    
    if (data.isNewRecord) {
        messageElement.innerHTML = `
            <h3 style="color: #FFD700; margin: 0 0 15px 0;">🏆 ¡NUEVO RÉCORD! 🏆</h3>
            <p style="margin: 5px 0; color: #ccc;">Puntuación original: ${originalScore}</p>
            <p style="margin: 5px 0; color: #fff;">Dificultad: ${data.difficultyName}</p>
            <p style="margin: 5px 0; color: #4CAF50;">Multiplicador: x${data.multiplier}</p>
            <p style="margin: 10px 0 0 0; font-size: 18px; color: #FFD700;">Puntuación final: ${data.finalScore}</p>
        `;
    } else {
        messageElement.innerHTML = `
            <h3 style="color: #4CAF50; margin: 0 0 15px 0;">✅ Puntaje Guardado</h3>
            <p style="margin: 5px 0; color: #ccc;">Puntuación original: ${originalScore}</p>
            <p style="margin: 5px 0; color: #fff;">Dificultad: ${data.difficultyName}</p>
            <p style="margin: 5px 0; color: #4CAF50;">Multiplicador: x${data.multiplier}</p>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Puntuación final: ${data.finalScore}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #ccc;">Tu mejor: ${data.bestScore}</p>
        `;
    }
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        if (document.body.contains(messageElement)) {
            document.body.removeChild(messageElement);
        }
    }, 4000);
}
