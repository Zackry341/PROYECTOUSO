import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';

export function Wheel(x) {
	const wheel = new THREE.Mesh(
		new THREE.BoxGeometry(12, 33, 12),
		new THREE.MeshLambertMaterial({
			color: '#000000',
			flatShading: true,
		})
	);
	wheel.position.set(x, 0, 6);
	return wheel;
}
