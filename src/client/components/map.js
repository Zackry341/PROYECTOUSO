import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { generateRows } from '/utilities/generateRows.js';
import { Grass } from '/components/Grass.js';
import { tilesPerRow, tileSize } from '/js/constants.js';
import { Tree } from '/components/Tree.js';
import { Road } from '/components/Road.js';
import { Car } from '/components/Car.js';
import { Truck } from '/components/Truck.js';

export const metadata = [];

export const map = new THREE.Group();

//funcion para ver la grid del mapa
export function createGrid() {
	const gridHelper = new THREE.GridHelper(tileSize * tilesPerRow, tilesPerRow, 0x0000ff, 0x808080);
	gridHelper.rotation.x = Math.PI / 2; //Se utiliza PI porque equivale a 180 grados
	gridHelper.position.set(0, 0.01, 0);
	map.add(gridHelper);
}

export function initializeMap() {
	metadata.length = 0;
	map.remove(...map.children);

	for (let rowIndex = 0; rowIndex > -5; rowIndex--) {
		const grass = Grass(rowIndex);
		map.add(grass);
	}
	addRows();
}

export function addRows() {
	const newMetadata = generateRows(20);
	const startIndex = metadata.length;
	metadata.push(...newMetadata); // Agrega las filas generadas a la metadata

	newMetadata.forEach((rowData, index) => {
		const rowIndex = startIndex + index + 1;

		if (rowData.type === 'forest') {
			//Los arboles estan generados en las tiles de grass
			const row = Grass(rowIndex);

			//Desestructuracion para obtener el tileIndex y height de cada árbol
			rowData.trees.forEach(({ tileIndex, height }) => {
				const three = Tree(tileIndex, height);
				row.add(three);
			});
			map.add(row);
		}
		if (rowData.type === 'car') {
			//Los autos en las tiles de road
			const row = Road(rowIndex);

			rowData.vehicles.forEach((vehicle) => {
				const car = Car(vehicle.initialTileIndex, rowData.direction, vehicle.color);
				vehicle.ref = car; // Guarda la referencia del auto en el objeto vehicle
				row.add(car); // Agrega el auto al grupo
			});
			map.add(row); // Agrega la fila al mapa
		}
		if (rowData.type === 'truck') {
			//Los camiones en las tiles de road
			const row = Road(rowIndex);

			rowData.vehicles.forEach((vehicle) => {
				const truck = Truck(vehicle.initialTileIndex, rowData.direction, vehicle.color);
				vehicle.ref = truck; // Guarda la referencia del camion en el objeto vehicle
				row.add(truck); // Agrega el camion al grupo
			});
			map.add(row); // Agrega la fila al mapa
		}
	});
}
