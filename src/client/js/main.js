console.log('script cargado main.js');
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { Renderer } from '/components/Renderer.js';
import { Camera, updateCameraOnResize } from '/components/Camera.js';
import { DirectionalLight } from '/components/DirectionalLight.js';
import { player, initializePlayer } from '/components/Player.js';
import { map, initializeMap, createGrid } from '/components/map.js';
import { animateVehicles } from '/components/animateVehicles.js';
import { animatePlayer } from '/js/animatePlayer.js';
import { hitTest } from '/js/hitTest.js';
export { renderer, animate };

// ===== VARIABLES GLOBALES =====
let currentUserCredits = 0;
let userBalance = 0;
let currentBet = 30;
const minBet = 30;

// ===== FUNCIONES DE CRÉDITOS =====
async function loadUserCredits() {
	try {
		const response = await fetch('/api/credits/balance');
		const data = await response.json();

		if (data.success) {
			currentUserCredits = data.credits;
			syncUserBalance();
			updateCreditsDisplay(currentUserCredits);
		}
	} catch (error) {
		console.error('Error al cargar créditos:', error);
		currentUserCredits = 0;
		syncUserBalance();
	}
}

function updateCreditsDisplay(credits) {
	const creditsElements = document.querySelectorAll('#credits-count, .current-credits');
	creditsElements.forEach((element) => {
		if (element) {
			element.textContent = credits.toLocaleString();
		}
	});
}

function syncUserBalance() {
	userBalance = currentUserCredits;
	updateBetDisplay();
}

// ===== FUNCIONES DE APUESTAS =====
function updateBetDisplay() {
	const currentBetElement = document.getElementById('current-bet');
	const userBalanceElement = document.getElementById('user-balance');

	if (currentBetElement) {
		currentBetElement.textContent = currentBet.toLocaleString();
	}
	if (userBalanceElement) {
		userBalanceElement.textContent = userBalance.toLocaleString();
	}

	// Deshabilitar botones según condiciones
	const decreaseBtns = document.querySelectorAll('.bet-btn.decrease');
	const increaseBtns = document.querySelectorAll('.bet-btn.increase');

	decreaseBtns.forEach((btn) => {
		const amount = parseInt(btn.textContent.replace(/[^\d]/g, ''));
		btn.disabled = currentBet - amount < minBet;
	});

	increaseBtns.forEach((btn) => {
		const amount = parseInt(btn.textContent.replace(/[^\d]/g, ''));
		btn.disabled = currentBet + amount > userBalance;
	});
}

function getCurrentBet() {
	return currentBet;
}

// ===== ELEMENTOS DEL DOM =====
const mainMenuModal = document.getElementById('main-menu-modal');
const startGameBtn = document.getElementById('start-game');
const showScoreboardBtn = document.getElementById('show-scoreboard');
const resultDom = document.getElementById('result-container');
const viewScoreboardBtn = document.getElementById('view-scoreboard');
const scoreboardModal = document.getElementById('scoreboard-modal');
const scoreboardTable = document.getElementById('scoreboard-table');
const closeScoreboardBtn = document.getElementById('close-scoreboard');
const clearScoreboardBtn = document.getElementById('clear-scoreboard');
const selectDifficultyBtn = document.getElementById('select-difficulty');

// ===== CONFIGURACIÓN THREE.JS =====
const scene = new THREE.Scene();
scene.add(player);
scene.add(map);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const dirLight = DirectionalLight();
dirLight.target = player;
player.add(dirLight);

const camera = new Camera();
player.add(camera);

const scoreDom = document.getElementById('score');

// ===== EVENT LISTENERS DEL JUEGO =====
if (mainMenuModal) {
	mainMenuModal.classList.remove('hidden');
	if (resultDom) resultDom.style.visibility = 'hidden';
}

document.getElementById('start-game')?.addEventListener('click', async () => {
    mainMenuModal.classList.add('hidden');
    
    try {
        // Obtener dificultad seleccionada
        const response = await fetch('/api/difficulty/current');
        const data = await response.json();
        
        if (data.success) {
            window.currentUserDifficulty = data.difficulty;
        } else {
            window.currentUserDifficulty = 1; // Valor por defecto
        }
        
        // ✅ QUITAR la segunda llamada a initializeGame
        await initializeGame(); // Solo una llamada
        console.log('juego iniciado');
    } catch (error) {
        console.error('Error al obtener la dificultad:', error);
        window.currentUserDifficulty = 1;
        await initializeGame();
    }
});

showScoreboardBtn?.addEventListener('click', async () => {
	mainMenuModal.classList.add('hidden');
	if (scoreboardModal && scoreboardTable) {
		try {
			const res = await fetch('/api/scoreboard');
			const response = await res.json();

			// ✅ Verificar la nueva estructura
			const scores = response.success ? response.data : response;

			let html = `<table>
                <tr><th>Puesto</th><th>Nombre</th><th>Puntaje</th></tr>`;
			scores.forEach((row, idx) => {
				html += `<tr><td>${idx + 1}</td><td>${row.nombre}</td><td>${row.score}</td></tr>`;
			});
			html += `</table>`;

			scoreboardTable.innerHTML = html;
			scoreboardModal.classList.add('active');
		} catch (error) {
			console.error('Error al cargar scoreboard:', error);
		}
	}
});


selectDifficultyBtn?.addEventListener('click', () => {
    window.location.href = '/pages/bonus.html';
});


// Ver scoreboard desde el modal de game over
viewScoreboardBtn?.addEventListener('click', async () => {
	if (scoreboardModal && scoreboardTable) {
		try {
			const res = await fetch('/api/scoreboard');
			const response = await res.json();

			// ✅ Verificar la nueva estructura
			const scores = response.success ? response.data : response;

			let html = `<table>
                <tr><th>Puesto</th><th>Nombre</th><th>Puntaje</th></tr>`;
			scores.forEach((row, idx) => {
				html += `<tr><td>${idx + 1}</td><td>${row.nombre}</td><td>${row.score}</td></tr>`;
			});
			html += `</table>`;

			scoreboardTable.innerHTML = html;
			scoreboardModal.classList.add('active');
			if (resultDom) resultDom.style.visibility = 'hidden';
		} catch (error) {
			console.error('Error al cargar scoreboard:', error);
		}
	}
});

closeScoreboardBtn?.addEventListener('click', () => {
	scoreboardModal.classList.remove('active');
	mainMenuModal.classList.remove('hidden');
});

document.getElementById('back-to-menu')?.addEventListener('click', () => {
	document.getElementById('result-container').style.visibility = 'hidden';
	document.getElementById('scoreboard').style.display = 'none';
	mainMenuModal.classList.remove('hidden');
});

// Pausa dentro del juego
const pauseModal = document.getElementById('pause-modal');
const resumeBtn = document.getElementById('resume-game');
const backToMenuBtn = document.getElementById('back-to-main-menu');

let isPaused = false;
function pauseGame() {
	isPaused = true;
	if (window.renderer) window.renderer.setAnimationLoop(null);
	pauseModal.style.display = 'flex';
}
function resumeGame() {
	isPaused = false;
	if (window.renderer && window.animate) window.renderer.setAnimationLoop(window.animate);
	pauseModal.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape' && !isPaused) {
		pauseGame();
	} else if (e.key === 'Escape' && isPaused) {
		resumeGame();
	}
});

resumeBtn?.addEventListener('click', resumeGame);

backToMenuBtn?.addEventListener('click', () => {
	window.location.href = '/game';
});

// ===== EVENT LISTENERS DE APUESTAS =====
document.addEventListener('DOMContentLoaded', function () {
	// Event listeners para botones de apuesta
	document.getElementById('bet-plus-1')?.addEventListener('click', () => {
		if (currentBet + 1 <= userBalance) {
			currentBet += 1;
			updateBetDisplay();
		}
	});

	document.getElementById('bet-plus-10')?.addEventListener('click', () => {
		if (currentBet + 10 <= userBalance) {
			currentBet += 10;
			updateBetDisplay();
		}
	});

	document.getElementById('bet-plus-100')?.addEventListener('click', () => {
		if (currentBet + 100 <= userBalance) {
			currentBet += 100;
			updateBetDisplay();
		}
	});

	document.getElementById('bet-minus-1')?.addEventListener('click', () => {
		if (currentBet - 1 >= minBet) {
			currentBet -= 1;
			updateBetDisplay();
		}
	});

	document.getElementById('bet-minus-10')?.addEventListener('click', () => {
		if (currentBet - 10 >= minBet) {
			currentBet -= 10;
			updateBetDisplay();
		}
	});

	document.getElementById('bet-minus-100')?.addEventListener('click', () => {
		if (currentBet - 100 >= minBet) {
			currentBet -= 100;
			updateBetDisplay();
		}
	});

	// Cargar créditos al inicializar
	loadUserCredits();
});

// ===== EVENT LISTENERS DE TIENDA =====
document.getElementById('shop-button')?.addEventListener('click', function () {
	loadUserCredits(); // Refrescar créditos antes de mostrar la tienda
	document.getElementById('shop-modal').style.display = 'block';
});

document.getElementById('close-shop')?.addEventListener('click', function () {
	document.getElementById('shop-modal').style.display = 'none';
});

window.addEventListener('click', function (event) {
	const modal = document.getElementById('shop-modal');
	if (event.target === modal) {
		modal.style.display = 'none';
	}
});

// ===== FUNCIONALIDAD DE COMPRA =====
document.querySelectorAll('.buy-btn').forEach((button) => {
	button.addEventListener('click', async function () {
		const creditItem = this.closest('.credit-item');
		const amount = parseInt(
			creditItem.querySelector('.credit-amount').textContent.replace(/[^\d]/g, '')
		);
		const price = creditItem.querySelector('.credit-price').textContent;

		const bonusElement = creditItem.querySelector('.bonus');
		const bonus = bonusElement ? parseInt(bonusElement.textContent.replace(/[^\d]/g, '')) : 0;

		const packageName = creditItem.querySelector('.package-name')?.textContent || 'Paquete de créditos';

		try {
			const response = await fetch('/api/credits/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					amount: amount,
					bonus: bonus,
					price: price,
					packageName: packageName,
				}),
			});

			const data = await response.json();

			if (data.success) {
				currentUserCredits = data.newBalance;
				updateCreditsDisplay(currentUserCredits);
				syncUserBalance();

				document.getElementById('shop-modal').style.display = 'none';
				showSuccessModal(
					data.transaction.baseCredits,
					data.transaction.bonusCredits,
					data.transaction.price,
					data.newBalance
				);
			} else {
				alert('Error al procesar la compra: ' + data.message);
			}
		} catch (error) {
			console.error('Error en la compra:', error);
			alert('Error de conexión al procesar la compra');
		}
	});
});

function showSuccessModal(credits, bonus, price, newBalance) {
	document.getElementById('credits-obtained').textContent =
		bonus > 0
			? `${credits.toLocaleString()} + ${bonus.toLocaleString()} Bonus`
			: `${credits.toLocaleString()}`;
	document.getElementById('amount-paid').textContent = price;
	document.getElementById('new-balance').textContent = `${newBalance.toLocaleString()} Créditos`;

	document.getElementById('success-modal').style.display = 'block';
}

// ===== MODALES DE ÉXITO =====
document.getElementById('close-success')?.addEventListener('click', function () {
	document.getElementById('success-modal').style.display = 'none';
});

document.getElementById('continue-shopping')?.addEventListener('click', function () {
	document.getElementById('success-modal').style.display = 'none';
	document.getElementById('shop-modal').style.display = 'block';
});

document.getElementById('start-playing')?.addEventListener('click', function () {
	mainMenuModal.classList.add('hidden');
	document.getElementById('success-modal').style.display = 'none';
	initializeGame();
});

// Event listener para el botón de cerrar sesión
document.getElementById('logout-button').addEventListener('click', async function() {
    // Agregar clase loading al botón
    this.classList.add('loading');
    this.disabled = true;
    
    try {
        // Llamar al endpoint de logout
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Verificar si la respuesta es JSON válido
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('El servidor no devolvió JSON válido');
        }

        const data = await response.json();

        if (response.ok && data.success) {
            // Limpiar datos locales
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirigir inmediatamente
            window.location.href = data.redirect || '/';
        } else {
            throw new Error(data.message || 'Error al cerrar sesión');
        }
        
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        
        // Si hay error, forzar redirección a login
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    } finally {
        // Remover loading (aunque probablemente no se vea por la redirección)
        this.classList.remove('loading');
        this.disabled = false;
    }
});


// ===== FUNCIONES DEL JUEGO =====
async function initializeGame() {
    const currentBet = window.getCurrentBet ? window.getCurrentBet() : 30;

    try {
        // ✅ AGREGAR: Obtener dificultad antes de iniciar
        const difficultyResponse = await fetch('/api/difficulty/current');
        const difficultyData = await difficultyResponse.json();
        
        if (difficultyData.success) {
            window.currentUserDifficulty = difficultyData.difficulty;
        } else {
            window.currentUserDifficulty = 1; // Default
        }

        // Descontar la apuesta al iniciar
        const response = await fetch('/api/credits/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: currentBet }),
        });

        const data = await response.json();

        if (data.success) {
            if (window.updateCredits) {
                window.updateCredits(data.newBalance);
            }

            initializePlayer();
            initializeMap();

            if (scoreDom) {
                scoreDom.innerText = '0';
            }
            if (resultDom) {
                resultDom.style.visibility = 'hidden';
            }
            if (window.renderer && window.animate) {
                window.renderer.setAnimationLoop(window.animate);
            }
        } else {
            alert('Créditos insuficientes para iniciar el juego');
            mainMenuModal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al iniciar juego:', error);
        alert('Error al procesar el inicio del juego');
        mainMenuModal.classList.remove('hidden');
    }
}

const renderer = new Renderer();
renderer.setAnimationLoop(animate);

function animate() {
	animateVehicles();
	animatePlayer();
	hitTest();
	renderer.render(scene, camera);
}

// ===== EXPORTAR VARIABLES Y FUNCIONES GLOBALES =====
window.renderer = renderer;
window.animate = animate;
window.syncUserBalance = syncUserBalance;
window.currentUserCredits = currentUserCredits;
window.getCurrentBet = getCurrentBet;
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    // Actualizar cámara
    updateCameraOnResize();
    
    // Actualizar renderer
    if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    // Re-render la escena
    if (scene && camera) {
        renderer.render(scene, camera);
    }
}
