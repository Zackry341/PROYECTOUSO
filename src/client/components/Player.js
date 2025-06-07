import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { endsUpInValidPosition } from '/utilities/endsUpInValidPosition.js';
import { metadata as rows, addRows } from '/components/map.js';

export const player = Player();

function Player() {
	const player = new THREE.Group();

	const body = new THREE.Mesh(
		//Creamos el cubo que representara al jugador
		new THREE.BoxGeometry(15, 15, 25),
		//Propiedades del cubo
		new THREE.MeshLambertMaterial({
			color: '#ffffff',
			flatShading: true,
		})
	);
	// Posicion del jugador
	body.position.set(0, 0, 10);
	body.castShadow = true;
	body.receiveShadow = true;
	player.add(body);

	const cap = new THREE.Mesh(
		new THREE.BoxGeometry(2, 4, 2),
		new THREE.MeshLambertMaterial({
			color: '#ff0000',
			flatShading: true,
		})
	);
	cap.position.set(0, 0, 25);
	cap.castShadow = true;
	cap.receiveShadow = true;
	player.add(cap);

	const playerContainer = new THREE.Group();
	playerContainer.add(player);

	return playerContainer;
}

export const position = {
	currentRow: 0,
	currentTile: 0,
};

export const movesQueue = []; // Cola de movimientos inicialmente vacia

export function initializePlayer() {
	// Inicializa la posicion del jugador
	player.position.x = 0;
	player.position.y = 0;
	player.children[0].position.z = 0;

	position.currentRow = 0;
	position.currentTile = 0;

	// Limpia la cola de movimientos
	movesQueue.length = 0;
}

export function queueMove(direction) {
	// Verifica si el movimiento es valido
	const isValidMove = endsUpInValidPosition(
		{
			rowIndex: position.currentRow,
			tileIndex: position.currentTile,
		},
		[...movesQueue, direction]
	);
	if (!isValidMove) {
		// console.warn('Movimiento no valido');
		return;
	}
	movesQueue.push(direction); // Agrega los movimiento a la cola
}

// Sacara el movimiento de la cola y actualizara la posicion del jugador
export function stepCompleted() {
    const direction = movesQueue.shift();
    if (direction === 'forward') position.currentRow += 1;
    if (direction === 'backward') position.currentRow -= 1;
    if (direction === 'left') position.currentTile -= 1;
    if (direction === 'right') position.currentTile += 1;

    if (position.currentRow > rows.length - 10) {
        addRows();
    }

    // ✅ CAMBIAR: Mostrar score con multiplicador aplicado
    const scoreDOM = document.getElementById('score');
    if (scoreDOM) {
        const rawScore = position.currentRow;
        const difficulty = window.currentUserDifficulty || 1;
        
        // Aplicar multiplicador para visualización
        const difficultyMultipliers = { 1: 1, 2: 3, 3: 5 };
        const multiplier = difficultyMultipliers[difficulty];
        const displayScore = rawScore * multiplier;
        
        // Mostrar score con multiplicador y dificultad
        scoreDOM.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 1.2em; font-weight: bold;">${displayScore.toLocaleString()}</div>
                <div style="font-size: 0.8em; opacity: 0.8;">
                    ${rawScore} × ${multiplier} (${getDifficultyName(difficulty)})
                </div>
            </div>
        `;
    }
}

// ✅ AGREGAR función helper
function getDifficultyName(difficulty) {
    switch(difficulty) {
        case 1: return 'Fácil';
        case 2: return 'Medio';
        case 3: return 'Difícil';
        default: return 'Fácil';
    }
}
