
document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.tarjetas-container');
    const tarjetas = document.querySelectorAll('.tarjeta');
    let isHovering = false;

    // Función para hacer pulsar todas las tarjetas
    function pulsarTarjetas() {
        if (isHovering) return; // No pulsar si hay hover

        // Aplicar la clase de pulso
        tarjetas.forEach(tarjeta => {
            tarjeta.classList.add('tarjeta-pulsando');
        });

        // Quitar la clase después de 0.8 segundos
        setTimeout(() => {
            tarjetas.forEach(tarjeta => {
                tarjeta.classList.remove('tarjeta-pulsando');
            });
        }, 800);
    }

    // Añadir la clase hover-activo después de que termine la animación inicial
    setTimeout(function () {
        container.classList.add('hover-activo');

        // Iniciar el intervalo de pulso cada 3 segundos
        pulseInterval = setInterval(pulsarTarjetas, 3000);

        // Controlar el hover en las tarjetas
        tarjetas.forEach(tarjeta => {
            tarjeta.addEventListener('mouseenter', function () {
                isHovering = true;

                // Asegurar que no hay tarjetas pulsando
                tarjetas.forEach(card => {
                    card.classList.remove('tarjeta-pulsando');
                });
            });

            tarjeta.addEventListener('mouseleave', function () {
                // Verificar si el mouse está sobre alguna otra tarjeta
                const stillHovering = Array.from(tarjetas).some(card =>
                    card.matches(':hover')
                );

                if (!stillHovering) {
                    isHovering = false;
                }
            });
        });
    }, 1300);

    const tarjetaEasy = document.getElementById('tarjetaEasy');
    const tarjetaMedium = document.getElementById('tarjetaMedium');
    const tarjetaHard = document.getElementById('tarjetaHard');

    tarjetaEasy.addEventListener('click', function () {
        saveDifficulty(1); // Fácil
        window.location.replace('/game');
    });

    tarjetaMedium.addEventListener('click', function () {
        saveDifficulty(2); // Medio
        window.location.replace('/game');
    });

    tarjetaHard.addEventListener('click', function () {
        saveDifficulty(3); // Difícil
        window.location.replace('/game');
    });

    // Función para guardar la dificultad
    async function saveDifficulty(difficulty) {
        try {
            const response = await fetch('/api/difficulty/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ difficulty: difficulty })
            });

            const data = await response.json();

            if (data.success) {
                console.log('Dificultad guardada:', difficulty);
                // Aquí puedes agregar lógica adicional, como redirigir a otra página
            } else {
                console.error('Error al guardar dificultad:', data.message);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
        }
    }

});


