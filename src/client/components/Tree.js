import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { tileSize } from '/js/constants.js';

export function Tree(tileIndex, height) {
	const tree = new THREE.Group();
	tree.position.set(tileIndex * tileSize, 0, 0);

	const trunk = new THREE.Mesh(
		new THREE.BoxGeometry(15, 15, 20),
		new THREE.MeshLambertMaterial({
			color: '#8B4513',
			flatShading: true,
		})
	);
	trunk.position.set(0, 0, 10);
	tree.add(trunk);

	const foliage = new THREE.Mesh(
		new THREE.BoxGeometry(30, 32, height),
		// new THREE.SphereGeometry(10, 32, height),
		new THREE.MeshLambertMaterial({
			color: '#228B22',
			flatShading: true,
		})
	);
	foliage.position.set(0, 0, height / 2 + 20);
	foliage.castShadow = true;
	foliage.receiveShadow = true;
	tree.add(foliage);

	return tree;
}
