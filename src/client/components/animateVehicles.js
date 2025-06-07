import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { metadata as rows } from '/components/map.js';
import { minTileIndex, maxTileIndex, tileSize } from '/js/constants.js';

const clock = new THREE.Clock();

export function animateVehicles() {
	const delta = clock.getDelta(); // Obtenemos el tiempo desde el último frame

	rows.forEach((rowData) => {
		if (rowData.type === 'car' || rowData.type === 'truck') {
			const initialRow = (minTileIndex - 2) * tileSize;
			const endOfRow = (maxTileIndex + 2) * tileSize;

			rowData.vehicles.forEach(({ ref }) => {
				if (!ref) {
					throw new Error('Vehiculo no existe'); //
				}
				if (rowData.direction) {
					ref.position.x = ref.position.x > endOfRow ? initialRow : ref.position.x + rowData.speed * delta; // Cuando el vehículo sale, reaparece en el inicio (movimiento a la derecha)
					/*
                    if (ref.position.x > endOfRow) {
                        ref.position.x = initialRow; // Si el vehículo sale del área, reaparece en el inicio
                    } else {
                        ref.position.x += rowData.speed * delta; // Si no, sigue avanzando
                    }
                    */
				} else {
					ref.position.x = ref.position.x < initialRow ? endOfRow : ref.position.x - rowData.speed * delta; // Cuando el vehículo sale, reaparece en el final (movimiento a la izquierda)
					/*
                    if (ref.position.x < initialRow) {
                        ref.position.x = endOfRow; // Si el vehículo sale del área, reaparece en el final
                    } else {
                        ref.position.x -= rowData.speed * delta; // Si no, sigue moviéndose a la izquierda
                    }
                    */
				}
			});
		}
	});
}
