import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { minTileIndex, maxTileIndex } from '/js/constants.js';

export function generateRows(amount) {
	const rows = [];
	for (let i = 0; i < amount; i++) {
		const rowData = generateRow();
		rows.push(rowData);
	}
	return rows;
}

function generateRow() {
	const type = randomElement(['car', 'truck', 'forest']);
	if (type === 'car') return generateCarLaneMetadata();
	if (type === 'truck') return generateTruckLaneMetadata();
	return generateForesMetadata();
}

function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function generateForesMetadata() {
	const occupiedTiles = new Set();
	const trees = Array.from({ length: 4 }, () => {
		let tileIndex;
		do {
			tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
		} while (occupiedTiles.has(tileIndex));
		occupiedTiles.add(tileIndex);

		const height = randomElement([20, 45, 60]);

		return { tileIndex, height };
	});

	return { type: 'forest', trees };
}

//Pa la velocidad segun la dificultad
function getBaseSpeed(direction) {
	const difficulty = window.currentUserDifficulty || 1;
	let baseSpeed;
	// Solo para debug
	// console.log('InGame - Dificultad:', difficulty);
	switch (difficulty) {
		case 1:
			baseSpeed = 150;
			break;
		case 2:
			baseSpeed = 250;
			break;
		case 3:
			baseSpeed = 350;
			break;
		default:
			baseSpeed = 100;
			console.log('Dificultad no reconocida, usando velocidad base de 100');
	}
	const randomValue = Math.random() * 50;
	return direction ? baseSpeed + randomValue : baseSpeed - randomValue;
}

function generateCarLaneMetadata() {
	const direction = randomElement([true, false]);
	const speed = getBaseSpeed(direction);
	// Solo para debug
	// console.log('Speed autos:', speed);

	const occupiedTiles = new Set();

	const vehicles = Array.from({ length: 3 }, () => {
		let initialTileIndex;
		do {
			initialTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
		} while (occupiedTiles.has(initialTileIndex));
		occupiedTiles.add(initialTileIndex - 1);
		occupiedTiles.add(initialTileIndex);
		occupiedTiles.add(initialTileIndex + 1);

		const color = randomElement([0xa52523, 0xbdb638, 0x78b14b]);

		return { initialTileIndex, color };
	});

	return { type: 'car', direction, speed, vehicles };
}

function generateTruckLaneMetadata() {
	const direction = randomElement([true, false]);
	const speed = getBaseSpeed(direction);
	// Solo para debug
	// console.log('Speed camiones:', speed);

	const occupiedTiles = new Set();

	const vehicles = Array.from({ length: 2 }, () => {
		let initialTileIndex;
		do {
			initialTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
		} while (occupiedTiles.has(initialTileIndex));
		occupiedTiles.add(initialTileIndex - 2);
		occupiedTiles.add(initialTileIndex - 1);
		occupiedTiles.add(initialTileIndex);
		occupiedTiles.add(initialTileIndex + 1);
		occupiedTiles.add(initialTileIndex + 2);

		const color = randomElement([0xa52523, 0xbdb638, 0x78b14b]);

		return { initialTileIndex, color };
	});

	return { type: 'truck', direction, speed, vehicles };
}
