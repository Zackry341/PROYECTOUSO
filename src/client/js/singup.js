document.addEventListener('DOMContentLoaded', function () {
    const singupForm = document.getElementById('singupForm');
    const modal = document.getElementById('modal');
    const cerrarModal = document.getElementById('cerrar-modal');
    const btnContinuar = document.getElementById('btn-continuar');
    const textoModal = document.getElementById('texto-modal');
    const modalContenido = document.querySelector('.modal-contenido');
    const loadingModal = document.getElementById('loading-modal');
    const showPasswordBtns = document.querySelectorAll('.show-password-btn');



    // Validación de campos
    const nombre = document.getElementById('nombre');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const telefono = document.getElementById('telefono');
    const terminos = document.getElementById('terminos');
    const submitButton = singupForm.querySelector('button[type="submit"]');


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

    // NUEVO: Estado de validación
    const validationState = {
        nombre: false,
        email: false,
        password: false,
        confirmPassword: false,
        telefono: false,
        terminos: false
    };

    // NUEVO: Función para actualizar estado del botón
    function updateSubmitButton() {
        const allValid = Object.values(validationState).every(valid => valid);

        if (allValid) {
            submitButton.disabled = false;
            submitButton.classList.remove('disabled');
            submitButton.classList.add('enabled');
        } else {
            submitButton.disabled = true;
            submitButton.classList.add('disabled');
            submitButton.classList.remove('enabled');
        }
    }

    // MEJORADO: Validación de nombre
    function validarNombre() {
        const value = nombre.value.trim();

        if (value === '') {
            nombreError.textContent = '';
            nombre.classList.remove('input-success', 'input-error');
            validationState.nombre = false;
        } else if (value.length < 3) {
            nombreError.textContent = 'El nombre debe tener al menos 3 caracteres';
            nombre.classList.remove('input-success');
            nombre.classList.add('input-error');
            validationState.nombre = false;
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            nombreError.textContent = 'El nombre solo puede contener letras y espacios';
            nombre.classList.remove('input-success');
            nombre.classList.add('input-error');
            validationState.nombre = false;
        } else {
            nombreError.textContent = '';
            nombre.classList.add('input-success');
            nombre.classList.remove('input-error');
            validationState.nombre = true;
        }

        updateSubmitButton();
        return validationState.nombre;
    }

    // MEJORADO: Validación de email
    function validarEmail() {
        const value = email.value.trim();

        if (value === '') {
            emailError.textContent = '';
            email.classList.remove('input-success', 'input-error');
            validationState.email = false;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                emailError.textContent = 'Ingresa un correo electrónico válido';
                email.classList.remove('input-success');
                email.classList.add('input-error');
                validationState.email = false;
            } else {
                emailError.textContent = '';
                email.classList.add('input-success');
                email.classList.remove('input-error');
                validationState.email = true;
            }
        }

        updateSubmitButton();
        return validationState.email;
    }

    // MEJORADO: Validación de contraseña
    function validarPassword() {
        const value = password.value;

        if (value === '') {
            passwordError.textContent = '';
            password.classList.remove('input-success', 'input-error');
            validationState.password = false;
        } else {
            const longitudMinima = value.length >= 8;
            const tieneMayusculas = /[A-Z]/.test(value);
            const tieneNumeros = /[0-9]/.test(value);
            const tieneEspeciales = /[!@#$%^&*(),.?":{}|<>]/.test(value);

            if (!longitudMinima || !tieneMayusculas || !tieneNumeros || !tieneEspeciales) {
                let mensaje = 'La contraseña debe tener:';
                if (!longitudMinima) mensaje += '<br>• Al menos 8 caracteres';
                if (!tieneMayusculas) mensaje += '<br>• Al menos una letra mayúscula';
                if (!tieneNumeros) mensaje += '<br>• Al menos un número';
                if (!tieneEspeciales) mensaje += '<br>• Al menos un carácter especial';

                passwordError.innerHTML = mensaje;
                password.classList.remove('input-success');
                password.classList.add('input-error');
                validationState.password = false;
            } else {
                passwordError.textContent = '';
                password.classList.add('input-success');
                password.classList.remove('input-error');
                validationState.password = true;
            }
        }

        // Re-validar confirmación de contraseña
        if (confirmPassword.value !== '') {
            validarConfirmPassword();
        }

        updateSubmitButton();
        return validationState.password;
    }

    // MEJORADO: Validación de confirmación de contraseña
    function validarConfirmPassword() {
        const value = confirmPassword.value;

        if (value === '') {
            confirmPasswordError.textContent = '';
            confirmPassword.classList.remove('input-success', 'input-error');
            validationState.confirmPassword = false;
        } else if (value !== password.value) {
            confirmPasswordError.textContent = 'Las contraseñas no coinciden';
            confirmPassword.classList.remove('input-success');
            confirmPassword.classList.add('input-error');
            validationState.confirmPassword = false;
        } else {
            confirmPasswordError.textContent = '';
            confirmPassword.classList.add('input-success');
            confirmPassword.classList.remove('input-error');
            validationState.confirmPassword = true;
        }

        updateSubmitButton();
        return validationState.confirmPassword;
    }

    // MEJORADO: Validación de teléfono
    function validarTelefono() {
        const value = telefono.value.trim();

        if (value === '') {
            telefonoError.textContent = '';
            telefono.classList.remove('input-success', 'input-error');
            validationState.telefono = false;
        } else {
            const telefonoRegex = /^\d{8}$/;
            if (!telefonoRegex.test(value)) {
                telefonoError.textContent = 'Ingresa un número de teléfono válido (8 dígitos)';
                telefono.classList.remove('input-success');
                telefono.classList.add('input-error');
                validationState.telefono = false;
            } else {
                telefonoError.textContent = '';
                telefono.classList.add('input-success');
                telefono.classList.remove('input-error');
                validationState.telefono = true;
            }
        }

        updateSubmitButton();
        return validationState.telefono;
    }

    // NUEVO: Validación de términos
    function validarTerminos() {
        if (terminos.checked) {
            terminosError.textContent = '';
            validationState.terminos = true;
        } else {
            terminosError.textContent = 'Debes aceptar los términos y condiciones';
            validationState.terminos = false;
        }

        updateSubmitButton();
        return validationState.terminos;
    }

    // Event listeners para validación en tiempo real
    nombre.addEventListener('input', validarNombre);
    email.addEventListener('input', validarEmail);
    password.addEventListener('input', validarPassword);
    confirmPassword.addEventListener('input', validarConfirmPassword);
    telefono.addEventListener('input', validarTelefono);
    terminos.addEventListener('change', validarTerminos);

    // MEJORADO: Envío del formulario con manejo de errores robusto
    singupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Verificación anti-bot
        if (document.getElementById('website') && document.getElementById('website').value !== '') {
            return false;
        }

        // Verificar que todas las validaciones estén correctas
        if (!Object.values(validationState).every(valid => valid)) {
            mostrarModal('Por favor, completa todos los campos correctamente.', 'error');
            return;
        }

        // Deshabilitar botón y mostrar loading
        submitButton.disabled = true;
        submitButton.classList.add("loading");

        try {
            // Sanitizar datos
            const formData = {
                nombre: sanitizeInput(nombre.value.trim()),
                email: sanitizeInput(email.value.trim().toLowerCase()),
                password: password.value,
                telefono: sanitizeInput(telefono.value.trim())
            };

            // Enviar con timeout y retry
            const response = await fetchWithRetry('/api/singup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            }, 3); // 3 intentos

            const data = await response.json();

            if (response.ok && data.success) {
                mostrarModal('¡Registro exitoso! Redirigiendo...', 'success');

                setTimeout(() => {
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    } else {
                        window.location.href = '/bonus';
                    }
                }, 2000); 
            } else {
                throw new Error(data.message || 'Error en el registro');
            }

        } catch (error) {
            console.error('Error en registro:', error);

            let mensajeError = 'Error de conexión. Por favor, intenta nuevamente.';

            if (error.message && error.message !== 'Failed to fetch') {
                mensajeError = error.message;
            }

            mostrarModal(mensajeError, 'error');

            // NUEVO: Opción de recargar página en caso de error crítico
            if (error.message && error.message.includes('Error interno del servidor')) {
                setTimeout(() => {
                    if (confirm('Hubo un error en el servidor. ¿Deseas recargar la página?')) {
                        window.location.reload();
                    }
                }, 3000);
            }

        } finally {
            submitButton.disabled = false;
            submitButton.classList.remove("loading");
        }
    });

    // NUEVO: Función para mostrar modal con tipos
    function mostrarModal(mensaje, tipo) {
        const modalTitle = document.querySelector('.modal-contenido h3');

        if (tipo === 'success') {
            if (modalTitle) modalTitle.textContent = 'Registro Exitoso';
            textoModal.textContent = mensaje;
            textoModal.classList.remove('error');
            textoModal.classList.add('success');
            modalContenido.classList.remove('error');
            modalContenido.classList.add('success');
        } else {
            if (modalTitle) modalTitle.textContent = 'Error de Registro';
            textoModal.textContent = mensaje;
            textoModal.classList.add('error');
            textoModal.classList.remove('success');
            modalContenido.classList.add('error');
            modalContenido.classList.remove('success');
        }

        modal.style.display = 'flex';
    }

    // NUEVO: Fetch con reintentos
    async function fetchWithRetry(url, options, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetchWithTimeout(url, options, 10000);
                return response;
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Espera incremental
            }
        }
    }

    // Función existente mejorada
    function fetchWithTimeout(url, options, timeout = 10000) {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), timeout)
            )
        ]);
    }

    function sanitizeInput(input) {
        return input.replace(/<|>|"|'|`|;|\\/g, '');
    }

    // Inicializar botón como deshabilitado
    updateSubmitButton();

    // Event listeners existentes...
    cerrarModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    btnContinuar.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    showPasswordBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const passwordInput = btn.parentElement.querySelector('input[type="password"], input[type="text"]');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                btn.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });
});