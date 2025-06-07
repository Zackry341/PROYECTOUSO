import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';

export function DirectionalLight() {
	// const directLight = new TREE.DirectionalLight(0xffffff, 1);
	const directLight = new THREE.DirectionalLight();

	directLight.position.set(-100, -100, 200);
	directLight.up.set(0, 0, 1);
	directLight.castShadow = true;

	directLight.shadow.mapSize.width = 2048;
	directLight.shadow.mapSize.height = 2048;

	directLight.shadow.camera.up.set(0, 0, 1);
	directLight.shadow.camera.near = 50;
	directLight.shadow.camera.far = 400;
	directLight.shadow.camera.left = -400;
	directLight.shadow.camera.right = 400;
	directLight.shadow.camera.top = 400;
	directLight.shadow.camera.bottom = -400;

	return directLight;
}
