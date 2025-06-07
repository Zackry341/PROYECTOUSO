import { calculateFinalPosition } from '/utilities/calculateFinalPosition.js';
import { minTileIndex, maxTileIndex } from '/js/constants.js';
import { metadata as rows } from '/components/map.js';

export function endsUpInValidPosition(currentPosition, moves) {
	const finalPosition = calculateFinalPosition(currentPosition, moves);

	// Detecta si la posición final está fuera de los límites del mapa
	if (
		finalPosition.rowIndex === -1 ||
		finalPosition.tileIndex === minTileIndex - 1 ||
		finalPosition.tileIndex === maxTileIndex + 1
	) {
		return false;
	}
	// Detecta si el jugador golpea un obstáculo
	const finalRow = rows[finalPosition.rowIndex - 1];
	if (
		finalRow &&
		finalRow.type === 'forest' &&
		finalRow.trees.some((tree) => tree.tileIndex === finalPosition.tileIndex)
	) {
		return false;
	}

	return true;
}
