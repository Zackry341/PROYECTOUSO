
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';

let camera; // Variable global para la cámara

export function Camera() {
    // Detectar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Ajustar tamaño base según dispositivo
    const baseSize = isMobile ? 400 : 500;
    const viewRatio = window.innerWidth / window.innerHeight;
    
    // Cálculo mejorado para móviles
    let width, height;
    
    if (isMobile) {
        // En móviles, mantener proporción más estricta
        if (viewRatio < 1) {
            // Vertical (portrait)
            width = baseSize;
            height = baseSize / viewRatio;
        } else {
            // Horizontal (landscape)
            width = baseSize * viewRatio;
            height = baseSize;
        }
    } else {
        // Desktop (código original)
        width = viewRatio < 1 ? baseSize : baseSize * viewRatio;
        height = viewRatio < 1 ? baseSize / viewRatio : baseSize;
    }

    camera = new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        100,
        900
    );

    camera.up.set(0, 0, 1);
    camera.position.set(300, -300, 300);
    camera.lookAt(0, 0, 0);

    return camera;
}

export function updateCameraOnResize() {
    if (!camera) return;
    
    const size = 500;
    const viewRatio = window.innerWidth / window.innerHeight;
    const width = viewRatio < 1 ? size : size * viewRatio;
    const height = viewRatio < 1 ? size / viewRatio : size;

    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();
}

let orientationChangeTimeout;

window.addEventListener('orientationchange', () => {
    // Esperar a que la orientación se complete
    clearTimeout(orientationChangeTimeout);
    orientationChangeTimeout = setTimeout(() => {
        onWindowResize();
    }, 500);
});

// También manejar resize con debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(onWindowResize, 100);
});