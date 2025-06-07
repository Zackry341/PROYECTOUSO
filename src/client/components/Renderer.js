import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';

//Mayusculas para las funciones que regresan un objeto de ThreeJS
export function Renderer() {
	//Tomamos el canvas con class game y lo definimos como el canvas para dibujar
	const canvas = document.querySelector('canvas.game');
	if (!canvas) {
		throw new Error('Canvas element not found');
	}
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		antialias: true,
		//Transparente
		alpha: true,
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true; //Habilitar sombras

	return renderer;
}
