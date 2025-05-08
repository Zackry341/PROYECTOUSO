document.addEventListener('DOMContentLoaded', function () {
    const singupForm = document.getElementById('singupForm');
    const modal = document.getElementById('modal');
    const cerrarModal = document.getElementById('cerrar-modal');
    const btnContinuar = document.getElementById('btn-continuar');
    const textoModal = document.getElementById('texto-modal');
    const modalContenido = document.querySelector('.modal-contenido');

    // Validación de campos
    const nombre = document.getElementById('nombre');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const telefono = document.getElementById('telefono');
    const terminos = document.getElementById('terminos');

    // Mensajes de error
    const nombreError = document.getElementById('nombre-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const telefonoError = document.getElementById('telefono-error');
    const terminosError = document.getElementById('terminos-error');

    // Validación en tiempo real
    nombre.addEventListener('input', validarNombre);
    email.addEventListener('input', validarEmail);
    password.addEventListener('input', validarPassword);
    confirmPassword.addEventListener('input', validarConfirmPassword);
    telefono.addEventListener('input', validarTelefono);



    // Función para validar el campo de nombre
    function validarNombre() {
        if (nombre.value === '') {
            nombreError.textContent = '';
            nombre.classList.remove('input-success');
            nombre.classList.remove('input-error');
            return false;
        } else if (nombre.value.length < 3) {
            nombreError.textContent = 'El nombre debe tener al menos 3 caracteres';
            nombre.classList.remove('input-success');
            nombre.classList.add('input-error');
            return false;
        } else {
            nombreError.textContent = '';
            nombre.classList.add('input-success');
            nombre.classList.remove('input-error');
            return true;
        }
    }

    // Función para validar el campo de email
    function validarEmail() {
        if (email.value === '') {
            emailError.textContent = '';
            email.classList.remove('input-success');
            email.classList.remove('input-error');
            return false;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                emailError.textContent = 'Ingresa un correo electrónico válido';
                email.classList.remove('input-success');
                email.classList.add('input-error');
                return false;
            } else {
                emailError.textContent = '';
                email.classList.add('input-success');
                email.classList.remove('input-error');
                return true;
            }
        }
    }

    // Función para validar el campo de contraseña
    function validarPassword() {
        if (password.value === '') {
            passwordError.textContent = '';
            password.classList.remove('input-success');
            password.classList.remove('input-error');
            actualizarIndicadorFortaleza(); // Actualizar indicador incluso si está vacío
            return false;
        } else {
            // Verificar longitud mínima
            const longitudMinima = password.value.length >= 8;
            // Verificar presencia de mayúsculas
            const tieneMayusculas = /[A-Z]/.test(password.value);
            // Verificar presencia de números
            const tieneNumeros = /[0-9]/.test(password.value);
            // Verificar presencia de caracteres especiales
            const tieneEspeciales = /[!@#$%^&*(),.?":{}|<>]/.test(password.value);

            if (!longitudMinima || !tieneMayusculas || !tieneNumeros || !tieneEspeciales) {
                let mensaje = 'La contraseña debe tener:';
                if (!longitudMinima) mensaje += '<br>• Al menos 8 caracteres';
                if (!tieneMayusculas) mensaje += '<br>• Al menos una letra mayúscula';
                if (!tieneNumeros) mensaje += '<br>• Al menos un número';
                if (!tieneEspeciales) mensaje += '<br>• Al menos un carácter especial';
                
                passwordError.innerHTML = mensaje; // Usamos innerHTML para interpretar los <br>
                password.classList.remove('input-success');
                password.classList.add('input-error');
                return false;
            } else {
                passwordError.textContent = '';
                password.classList.add('input-success');
                password.classList.remove('input-error');
                return true;
            }
        }
    }

    // Función para validar el campo de confirmar contraseña
    function validarConfirmPassword() {
        if (confirmPassword.value === '') {
            confirmPasswordError.textContent = '';
            confirmPassword.classList.remove('input-success');
            confirmPassword.classList.remove('input-error');
            return false;
        } else if (confirmPassword.value !== password.value) {
            confirmPasswordError.textContent = 'Las contraseñas no coinciden';
            confirmPassword.classList.remove('input-success');
            confirmPassword.classList.add('input-error');
            return false;
        } else {
            confirmPasswordError.textContent = '';
            confirmPassword.classList.add('input-success');
            confirmPassword.classList.remove('input-error');
            return true;
        }
    }

    // Función para validar el campo de confirmar contraseña
    function validarConfirmPassword() {
        if (confirmPassword.value === '') {
            confirmPasswordError.textContent = '';
            confirmPassword.classList.remove('input-success');
            confirmPassword.classList.remove('input-error');
            return false;
        } else if (confirmPassword.value !== password.value) {
            confirmPasswordError.textContent = 'Las contraseñas no coinciden';
            confirmPassword.classList.remove('input-success');
            confirmPassword.classList.add('input-error');
            return false;
        } else {
            confirmPasswordError.textContent = '';
            confirmPassword.classList.add('input-success');
            confirmPassword.classList.remove('input-error');
            return true;
        }
    }

    // Función para validar el campo de teléfono
    function validarTelefono() {
        if (telefono.value === '') {
            telefonoError.textContent = '';
            telefono.classList.remove('input-success');
            telefono.classList.remove('input-error');
            return false;
        } else {
            const telefonoRegex = /^\d{8}$/;
            if (!telefonoRegex.test(telefono.value)) {
                telefonoError.textContent = 'Ingresa un número de teléfono válido (8 dígitos)';
                telefono.classList.remove('input-success');
                telefono.classList.add('input-error');
                return false;
            } else {
                telefonoError.textContent = '';
                telefono.classList.add('input-success');
                telefono.classList.remove('input-error');
                return true;
            }
        }
    }

    let formLoadTime = Date.now();

    // Envío del formulario
    singupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (document.getElementById('website').value !== '') {
            // Probablemente es un bot, rechazar el envío
            return false;
        }
        const timeElapsed = Date.now() - formLoadTime;
        if (timeElapsed < 3000) { // 3 segundos mínimo
            textoModal.textContent = 'Por favor, revisa cuidadosamente el formulario antes de enviarlo.';
            textoModal.classList.add('error');
            modalContenido.classList.add('error');
            modal.style.display = 'flex';
            return;
        }

        const submitButton = singupForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.classList.add("loading");

        // Validar todos los campos
        const isNombreValid = validarNombre();
        const isEmailValid = validarEmail();
        const isPasswordValid = validarPassword();
        const isConfirmPasswordValid = validarConfirmPassword();
        const isTelefonoValid = validarTelefono();

        // Validar términos y condiciones
        if (!terminos.checked) {
            terminosError.textContent = 'Debes aceptar los términos y condiciones';
            return;
        } else {
            terminosError.textContent = '';
        }

        // Si todos los campos son válidos, enviar al servidor
        if (isNombreValid && isEmailValid && isPasswordValid &&
            isConfirmPasswordValid && isTelefonoValid && terminos.checked) {

            // Función para sanitizar entradas
            function sanitizeInput(input) {
                // Eliminar caracteres potencialmente peligrosos
                return input.replace(/<|>|"|'|`|;|\\/g, '');
            }

            // Crear objeto con los datos del formulario
            const formData = {
                nombre: sanitizeInput(nombre.value),
                email: sanitizeInput(email.value).toLowerCase(),
                password: password.value,
                telefono: sanitizeInput(telefono.value)
            };
            

            // Enviar datos al servidor mediante fetch
            function fetchWithTimeout(url, options, timeout = 10000) {
                return Promise.race([
                    fetch(url, options),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Tiempo de espera agotado')), timeout)
                    )
                ]);
            }
            
            // Usar fetchWithTimeout en lugar de fetch
            fetchWithTimeout('/api/singup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            }, 8000)
                .then(response => {
                    // Clonar la respuesta para poder examinarla
                    const responseClone = response.clone();

                    return response.json().catch(err => {
                        // Si falla el parsing JSON, examinar el texto de la respuesta
                        return responseClone.text().then(text => {
                            console.error('La respuesta no es JSON válido');
                            throw new Error('Respuesta del servidor no es JSON válido');
                        });
                    });
                })
                .then(data => {
                    if (data.success) {
                        // redirigir a bonus.html
                        window.location.href = '/pages/bonus.html';
                    } else {
                        textoModal.textContent = 'Error al registrar. Por favor, intenta nuevamente.';
                        textoModal.classList.add('error');
                        modalContenido.classList.add('error');
                        modal.style.display = 'flex';
                    }
                    // Limpiar el formulario
                    singupForm.reset();
                    // remover input-success y input-error
                    nombre.classList.remove('input-success');
                    email.classList.remove('input-success');
                    password.classList.remove('input-success');
                    confirmPassword.classList.remove('input-success');
                    telefono.classList.remove('input-success');
                })
                .catch(error => {
                    console.error('Error:', error.name);
                    if (error.message === 'Tiempo de espera agotado') {
                        textoModal.textContent = 'La solicitud ha tardado demasiado. Por favor, verifica tu conexión e intenta nuevamente.';
                    } else {
                        textoModal.textContent = 'Error de conexión. Por favor, intenta nuevamente más tarde.';
                    }
                    textoModal.classList.add('error');
                    modalContenido.classList.add('error');
                    modal.style.display = 'flex';
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.classList.remove("loading");
                });
        }
    });

    // Configurar el cierre del modal
    cerrarModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    //boton de continuar
    btnContinuar.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
