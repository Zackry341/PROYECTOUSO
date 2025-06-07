// Variable global para créditos
let currentUserCredits = 0;

// Función para cargar información del usuario
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user-info');
        const data = await response.json();
        
        if (data.success) {
            updateUserDisplay(data.user);
        } else {
            console.error('Error al cargar información del usuario:', data.message);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

// Función para actualizar la visualización
function updateUserDisplay(user) {
    const usernameElement = document.getElementById('username');
    const bestScoreElement = document.getElementById('best-score');
    const creditsElement = document.getElementById('credits-count');
    const difficultyElement = document.getElementById('user-difficulty-display');
    
    if (usernameElement) {
        usernameElement.textContent = user.nombre;
    }
    
    if (bestScoreElement) {
        bestScoreElement.textContent = user.bestScore.toLocaleString();
    }
    
    if (creditsElement) {
        creditsElement.textContent = user.credits.toLocaleString();
    }
    
    // ✅ Actualizar dificultad
    if (difficultyElement) {
        const difficultyName = getDifficultyName(user.difficulty || 1);
        difficultyElement.textContent = difficultyName;
        
        // Aplicar color según dificultad
        difficultyElement.className = `difficulty-${user.difficulty || 1}`;
    }
    
    // Actualizar variables globales
    currentUserCredits = user.credits || 0;
    window.currentUserDifficulty = user.difficulty || 1;
    
    // Sincronizar con main.js si la función existe
    if (typeof window.syncUserBalance === 'function') {
        window.syncUserBalance();
    }
    
    // Actualizar variable global de main.js
    if (typeof window.currentUserCredits !== 'undefined') {
        window.currentUserCredits = currentUserCredits;
    }
}

// ✅ Función helper para nombres de dificultad (igual que hitTest.js)
function getDifficultyName(difficulty) {
    switch(difficulty) {
        case 1: return 'Fácil';
        case 2: return 'Medio';
        case 3: return 'Difícil';
        default: return 'Fácil';
    }
}

// ✅ Función para actualizar dificultad obteniendo del servidor (como hitTest.js)
async function updateDifficulty() {
    try {
        const response = await fetch('/api/difficulty/get');
        const data = await response.json();
        
        if (data.success) {
            const difficultyElement = document.getElementById('user-difficulty-display');
            if (difficultyElement) {
                const difficultyName = getDifficultyName(data.difficulty);
                difficultyElement.textContent = difficultyName;
                difficultyElement.className = `difficulty-${data.difficulty}`;
                
                // Efecto visual de actualización
                difficultyElement.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    difficultyElement.style.transform = 'scale(1)';
                }, 200);
                
                // Actualizar variable global
                window.currentUserDifficulty = data.difficulty;
            }
        }
    } catch (error) {
        console.error('Error al obtener dificultad:', error);
    }
}

// Función para actualizar créditos en tiempo real
function updateCredits(newCredits) {
    currentUserCredits = newCredits;
    
    const creditsElement = document.getElementById('credits-count');
    if (creditsElement) {
        creditsElement.textContent = newCredits.toLocaleString();
        
        // Efecto visual de actualización
        creditsElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            creditsElement.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Sincronizar con main.js
    if (typeof window.syncUserBalance === 'function') {
        window.syncUserBalance();
    }
    
    // Actualizar variable global de main.js
    if (typeof window.currentUserCredits !== 'undefined') {
        window.currentUserCredits = currentUserCredits;
    }
}

// Función para actualizar mejor puntuación
function updateBestScore(newScore) {
    const bestScoreElement = document.getElementById('best-score');
    if (bestScoreElement) {
        const currentBest = parseInt(bestScoreElement.textContent.replace(/,/g, ''));
        if (newScore > currentBest) {
            bestScoreElement.textContent = newScore.toLocaleString();
            
            // Efecto visual de nuevo récord
            bestScoreElement.style.color = '#00FF00';
            setTimeout(() => {
                bestScoreElement.style.color = '#FFD700';
            }, 1000);
        }
    }
}

// Cargar información al iniciar la página
document.addEventListener('DOMContentLoaded', loadUserInfo);

// Exportar funciones y variables para uso global
window.updateCredits = updateCredits;
window.updateBestScore = updateBestScore;
window.loadUserInfo = loadUserInfo;
window.currentUserCredits = currentUserCredits;
window.updateDifficulty = updateDifficulty; 
