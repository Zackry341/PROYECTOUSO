import { queueMove } from '/components/Player.js';

//Utilizando encadenamiento opcional para que, si los elementos no existen, no se rompa
document.getElementById('forward')?.addEventListener('click', () => queueMove('forward'));
document.getElementById('backward')?.addEventListener('click', () => queueMove('backward'));
document.getElementById('left')?.addEventListener('click', () => queueMove('left'));
document.getElementById('right')?.addEventListener('click', () => queueMove('right'));

//Alternativa para el movimiento (?
// window.addEventListener('keydown', (event) => {
// 	const direction = directionMap[event.key.toLowerCase()];
// 	if (direction) {
// 		event.preventDefault();
// 		queueMove(direction);
// 	}
// });

// Al presionar las teclas direccionales para el movimiento
window.addEventListener('keydown', (event) => {
	// Solucion temporal a un bug, inhabilita moverse si el menú está visible
	const mainMenu = document.getElementById('main-menu-modal');
	if (mainMenu && !mainMenu.classList.contains('hidden')) {
		return;
	}
	if (event.key === 'ArrowUp') {
		event.preventDefault();
		queueMove('forward');
	} else if (event.key === 'ArrowDown') {
		event.preventDefault();
		queueMove('backward');
	} else if (event.key === 'ArrowLeft') {
		event.preventDefault();
		queueMove('left');
	} else if (event.key === 'ArrowRight') {
		event.preventDefault();
		queueMove('right');
	}

});
