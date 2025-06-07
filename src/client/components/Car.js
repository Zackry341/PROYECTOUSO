import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { tileSize } from '/js/constants.js';
import { Wheel } from '/components/Wheel.js';

export function Car(initialTileIndex, direction, color) {
	const car = new THREE.Group();
	car.position.set(initialTileIndex * tileSize, 0, 0);
	if (!direction) {
		car.rotation.set = (0, 0, Math.PI); // Se utiliza PI porque equivale a 180 grados
	}

	const body = new THREE.Mesh(
		new THREE.BoxGeometry(60, 30, 15),
		new THREE.MeshLambertMaterial({
			color,
			flatShading: true,
		})
	);
	body.position.set(0, 0, 12);
	body.castShadow = true;
	body.receiveShadow = true;
	car.add(body);

	const cabin = new THREE.Mesh(
		// new THREE.BoxGeometry(30, 32, height),
		new THREE.BoxGeometry(33, 24, 12),
		new THREE.MeshLambertMaterial({
			color: '#ffffff',
			flatShading: true,
		})
	);
	cabin.position.set(-6, 0, 25.5);
	cabin.castShadow = true;
	cabin.receiveShadow = true;
	car.add(cabin);

	const frontWheel = Wheel(18);
	car.add(frontWheel);
	const backWheel = Wheel(-18);
	car.add(backWheel);

	return car;
}
