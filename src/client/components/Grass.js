import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { tilesPerRow, tileSize } from '/js/constants.js';

export function Grass(rowIndex) {
	const grass = new THREE.Group();
	grass.position.set(0, rowIndex * tileSize, 0);

	const foundation = new THREE.Mesh(
		new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 3),
		new THREE.MeshLambertMaterial({
			color: '#9ccc65',
		})
	);
	foundation.position.set(0, 0, 1.5);
	foundation.receiveShadow = true;
	grass.add(foundation);
	return grass;
}
