import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { tileSize } from '/js/constants.js';
import { Wheel } from '/components/Wheel.js';

export function Truck(initialTileIndex, direction, color) {
	const truck = new THREE.Group();
	truck.position.set(initialTileIndex * tileSize, 0, 0);
	if (!direction) {
		truck.rotation.set = (0, 0, Math.PI); // Se utiliza PI porque equivale a 180 grados
	}

	//  Obtener dificultad de la variable global que ya tienes
	const difficulty = window.currentUserDifficulty || 1;

	//  Velocidades simples según dificultad
	let baseSpeed;
	switch (difficulty) {
		case 1:
			baseSpeed = 0.02 + Math.random() * 0.02;
			break; // 0.02-0.04
		case 2:
			baseSpeed = 0.03 + Math.random() * 0.03;
			break; // 0.03-0.06
		case 3:
			baseSpeed = 0.05 + Math.random() * 0.05;
			break; // 0.05-0.10
		default:
			baseSpeed = 0.03 + Math.random() * 0.03;
			break;
	}

	const body = new THREE.Mesh(
		new THREE.BoxGeometry(70, 35, 35),
		new THREE.MeshLambertMaterial({
			color: '#b0bec5',
			flatShading: true,
		})
	);
	body.position.set(-15, 0, 25);
	body.castShadow = true;
	body.receiveShadow = true;
	truck.add(body);

	const cabin = new THREE.Mesh(
		// new THREE.BoxGeometry(30, 32, height),
		new THREE.BoxGeometry(30, 30, 30),
		new THREE.MeshLambertMaterial({
			color,
			flatShading: true,
		})
	);
	cabin.position.set(35, 0, 20);
	cabin.castShadow = true;
	cabin.receiveShadow = true;
	truck.add(cabin);

	const frontWheel = Wheel(37);
	truck.add(frontWheel);
	const middleWheel = Wheel(5);
	truck.add(middleWheel);
	const backWheel = Wheel(-35);
	truck.add(backWheel);

	return truck;
}
