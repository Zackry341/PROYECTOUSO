
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.tarjetas-container');
    const tarjetas = document.querySelectorAll('.tarjeta');
    let pulseInterval = null;
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
    setTimeout(function() {
        container.classList.add('hover-activo');
        
        // Iniciar el intervalo de pulso cada 3 segundos
        pulseInterval = setInterval(pulsarTarjetas, 3000);
        
        // Controlar el hover en las tarjetas
        tarjetas.forEach(tarjeta => {
            tarjeta.addEventListener('mouseenter', function() {
                isHovering = true;
                
                // Asegurar que no hay tarjetas pulsando
                tarjetas.forEach(card => {
                    card.classList.remove('tarjeta-pulsando');
                });
            });
            
            tarjeta.addEventListener('mouseleave', function() {
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
});


