import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { tilesPerRow, tileSize } from '/js/constants.js';

export function Road(rowIndex) {
	const road = new THREE.Group();
	road.position.set(0, rowIndex * tileSize, 0);

	const foundation = new THREE.Mesh(
		new THREE.PlaneGeometry(tilesPerRow * tileSize, tileSize, 3),
		new THREE.MeshBasicMaterial({
			color: '#212121',
		})
	);
	foundation.receiveShadow = true;
	road.add(foundation);
	return road;
}
