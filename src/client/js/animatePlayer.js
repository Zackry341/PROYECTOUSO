import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { movesQueue, stepCompleted } from '/components/Player.js';
import { tileSize } from '/js/constants.js';
import { player, position } from '/components/Player.js';

//Reloj pausado al inicio, se inicia al dar el primer paso
const moveClock = new THREE.Clock(false);

export function animatePlayer() {
	if (!movesQueue.length) return; // Si no hay movimientos, no hace nada
	if (!moveClock.running) {
		moveClock.start();
	}

	//Tiempo que tomara dar un paso en segundos
	const stepTime = 0.25;
	// Math.min para no pasar del 100%
	//0 significa que esta al principio del paso, y 1 significa que esta en la nueva posicion
	const progress = Math.min(1, moveClock.getElapsedTime() / stepTime);

	setPosition(progress);
	setRotation(progress);
	if (progress >= 1) {
		// Si el progreso es mayor o igual a 1 se completa el paso y se detiene el reloj
		stepCompleted();
		moveClock.stop();
	}
}

function setPosition(progress) {
	const startX = position.currentTile * tileSize;
	let endX = startX;
	const startY = position.currentRow * tileSize;
	let endY = startY;

	if (movesQueue[0] === 'forward') {
		endY += tileSize;
	} else if (movesQueue[0] === 'backward') {
		endY -= tileSize;
	} else if (movesQueue[0] === 'left') {
		endX -= tileSize;
	} else if (movesQueue[0] === 'right') {
		endX += tileSize;
	}

	player.position.x = THREE.MathUtils.lerp(startX, endX, progress);
	player.position.y = THREE.MathUtils.lerp(startY, endY, progress);
	player.children[0].position.z = Math.sin(progress * Math.PI) * 8;
}

function setRotation(progress) {
	let endRotation = 0;

	if (movesQueue[0] === 'forward') {
		endRotation = 0;
	} else if (movesQueue[0] === 'backward') {
		endRotation = Math.PI;
	} else if (movesQueue[0] === 'left') {
		endRotation = Math.PI / 2;
	} else if (movesQueue[0] === 'right') {
		endRotation = -Math.PI / 2;
	}

	player.children[0].rotation.z = THREE.MathUtils.lerp(
		player.children[0].rotation.z,
		endRotation,
		progress
	);
}
