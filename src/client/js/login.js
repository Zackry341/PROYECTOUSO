// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
	// Obtener referencias a elementos del DOM
	const loginForm = document.getElementById('loginForm');
	const usernameInput = document.getElementById('username');
	const passwordInput = document.getElementById('password');
	const usernameError = document.getElementById('username-error');
	const passwordError = document.getElementById('password-error');
	const captchaError = document.getElementById('captcha-error');
	const submitBtn = document.getElementById('submitBtn');
	const forgotPasswordLink = document.getElementById('forgotPasswordLink');
	const recuperarPasswordModal = document.getElementById('recuperar-password-modal');
	const recuperarPasswordForm = document.getElementById('recuperarPasswordForm');
	const recuperarEmailInput = document.getElementById('recuperarEmail');
	const recuperarEmailError = document.getElementById('recuperarEmail-error');
	const verificarCodigoModal = document.getElementById('verificar-codigo-modal');
	const nuevaPasswordModal = document.getElementById('nueva-password-modal');
	const verificarCodigoForm = document.getElementById('verificarCodigoForm');
	const nuevaPasswordForm = document.getElementById('nuevaPasswordForm');
	const codigoVerificacionInput = document.getElementById('codigoVerificacion');
	const codigoError = document.getElementById('codigo-error');
	const newPasswordInput = document.getElementById('newPassword');
	const confirmPasswordInput = document.getElementById('confirmPassword');
	const newPasswordError = document.getElementById('newPassword-error');
	const confirmPasswordError = document.getElementById('confirmPassword-error');
	const showPasswordBtns = document.querySelectorAll('.show-password-btn');

	//variables globales
	let resetEmail = '';

	// Función para validar formato de email
	function isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// Función para verificar el captcha
	function isCaptchaCompleted() {
		return grecaptcha && grecaptcha.getResponse().length !== 0;
	}

	// Función para mostrar el modal
	function mostrarModal(mensaje, esExito) {
		const modal = document.getElementById('mensaje-modal');
		const textoModal = document.getElementById('texto-modal');
		const modalContenido = document.querySelector('#mensaje-modal .modal-contenido');

		textoModal.textContent = mensaje;

		// Añadir clase según el tipo de mensaje
		if (esExito) {
			modalContenido.classList.add('exito');
			modalContenido.classList.remove('error');
		} else {
			modalContenido.classList.add('error');
			modalContenido.classList.remove('exito');
		}

		//limpiar formulario
		loginForm.reset();

		// Mostrar el modal
		modal.style.display = 'flex';

		// Configurar el cierre del modal
		document.querySelector('#mensaje-modal .cerrar-modal').onclick = function () {
			modal.style.display = 'none';
		};

		// Cerrar el modal al hacer clic fuera de él
		window.onclick = function (event) {
			if (event.target === modal) {
				modal.style.display = 'none';
			}
		};
	}

	// Configurar el modal de recuperación de contraseña
	forgotPasswordLink.addEventListener('click', function (e) {
		e.preventDefault();
		recuperarPasswordModal.style.display = 'flex';

		// Si hay un email en el campo de login, copiarlo al campo de recuperación
		if (usernameInput.value.trim() !== '' && isValidEmail(usernameInput.value.trim())) {
			recuperarEmailInput.value = usernameInput.value.trim();
		}
	});

	// Configurar cierre del modal de recuperación
	document.querySelector('#recuperar-password-modal .cerrar-modal').onclick = function () {
		recuperarPasswordModal.style.display = 'none';
		recuperarPasswordForm.reset();
		recuperarEmailError.textContent = '';
	};

	// Cerrar modal de recuperación al hacer clic fuera
	window.addEventListener('click', function (event) {
		if (event.target === recuperarPasswordModal) {
			recuperarPasswordModal.style.display = 'none';
			recuperarPasswordForm.reset();
			recuperarEmailError.textContent = '';
		}
	});

	// Manejar envío del formulario de recuperación (Paso 1)
	recuperarPasswordForm.addEventListener('submit', function (e) {
		e.preventDefault();

		// Evitar múltiples envíos
		const submitButton = recuperarPasswordForm.querySelector('button');
		if (submitButton.disabled) {
			return; // Si ya está deshabilitado, no hacer nada
		}

		// Validar email
		const email = recuperarEmailInput.value.trim();
		if (email === '') {
			recuperarEmailError.textContent = 'Por favor, ingresa tu correo electrónico';
			return;
		} else if (!isValidEmail(email)) {
			recuperarEmailError.textContent = 'Por favor, ingresa un correo electrónico válido';
			return;
		}

		// Guardar el email para usarlo en pasos posteriores
		resetEmail = email;

		// Cerrar el modal de recuperación y mostrar el modal de carga
		recuperarPasswordModal.style.display = 'none';
		document.getElementById('loading-modal').style.display = 'flex';

		// Enviar solicitud al servidor
		fetch('/api/reset-password-request', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		})
			.then((response) => response.json())
			.then((data) => {
				// Ocultar el modal de carga
				document.getElementById('loading-modal').style.display = 'none';

				if (data.success) {
					// Mostrar el modal para ingresar el código
					verificarCodigoModal.style.display = 'flex';
					document.getElementById('codigoVerificacion').select();
				} else {
					mostrarModal('No se pudo procesar tu solicitud. Por favor, intenta nuevamente.', false);
					// Limpiar formulario
					recuperarPasswordForm.reset();
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				// Ocultar el modal de carga
				document.getElementById('loading-modal').style.display = 'none';
				mostrarModal('Error de conexión. Por favor, intenta nuevamente.', false);
			});
	});

	// Manejar envío del formulario de verificación de código (Paso 2)
	verificarCodigoForm.addEventListener('submit', function (e) {
		e.preventDefault();

		const codigo = codigoVerificacionInput.value.trim();
		if (codigo.length !== 6 || !/^\d+$/.test(codigo)) {
			codigoError.textContent = 'Por favor, ingresa un código de 6 dígitos válido';
			return;
		}

		const submitButton = verificarCodigoForm.querySelector('button');
		submitButton.classList.add('loading');
		submitButton.disabled = true;

		fetch('/api/verify-reset-code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: resetEmail,
				codigo: codigo,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				submitButton.classList.remove('loading');
				submitButton.disabled = false;

				if (data.success) {
					// Cerrar modal de verificación
					verificarCodigoModal.style.display = 'none';
					// Mostrar modal para nueva contraseña
					nuevaPasswordModal.style.display = 'flex';
				} else {
					codigoError.textContent =
						data.message || 'Código inválido. Por favor, verifica e intenta nuevamente.';
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				submitButton.classList.remove('loading');
				submitButton.disabled = false;
				codigoError.textContent = 'Error de conexión. Por favor, intenta nuevamente.';
			});
	});

	// Manejar envío del formulario de nueva contraseña (Paso 3)
	nuevaPasswordForm.addEventListener('submit', function (e) {
		e.preventDefault();

		const newPassword = newPasswordInput.value;
		const confirmPassword = confirmPasswordInput.value;

		// Función para validar fortaleza de contraseña
		function isStrongPassword(password) {
			// Al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
			const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
			return regex.test(password);
		}

		// Validar contraseña
		if (newPassword.length < 8) {
			newPasswordError.textContent = 'La contraseña debe tener al menos 8 caracteres';
			return;
		} else if (!isStrongPassword(newPassword)) {
			newPasswordError.textContent =
				'La contraseña debe incluir mayúsculas, minúsculas, números y símbolos';
			return;
		} else {
			newPasswordError.textContent = '';
		}

		// Validar confirmación
		if (newPassword !== confirmPassword) {
			confirmPasswordError.textContent = 'Las contraseñas no coinciden';
			return;
		} else {
			confirmPasswordError.textContent = '';
		}

		const submitButton = nuevaPasswordForm.querySelector('button');
		submitButton.classList.add('loading');
		submitButton.disabled = true;

		fetch('/api/reset-password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: resetEmail,
				password: newPassword,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				submitButton.classList.remove('loading');
				submitButton.disabled = false;

				// Cerrar el modal
				nuevaPasswordModal.style.display = 'none';

				//cerrar modal de paso 3 y limpiar formulario
				recuperarPasswordModal.style.display = 'none';
				recuperarPasswordForm.reset();
				recuperarEmailError.textContent = '';
				codigoError.textContent = '';

				if (data.success) {
					mostrarModal('Tu contraseña ha sido actualizada correctamente.', true);
					// Limpiar todos los formularios
					recuperarPasswordForm.reset();
					verificarCodigoForm.reset();
					nuevaPasswordForm.reset();
				} else {
					mostrarModal('Error al actualizar la contraseña. Por favor, intenta nuevamente.', false);
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				submitButton.classList.remove('loading');
				submitButton.disabled = false;
				mostrarModal('Error de conexión. Por favor, intenta nuevamente.', false);
			});
	});

	// Agregar validación cuando se pierde el foco en la nueva contraseña
	newPasswordInput.addEventListener('blur', function () {
		const newPassword = newPasswordInput.value;

		// Validar longitud mínima solo si hay texto
		if (newPassword.length > 0 && newPassword.length < 6) {
			newPasswordError.textContent = 'La contraseña debe tener al menos 6 caracteres';
		} else {
			newPasswordError.textContent = '';
		}

		// Si hay texto en ambos campos, verificar si coinciden
		if (newPassword && confirmPasswordInput.value) {
			if (newPassword !== confirmPasswordInput.value) {
				confirmPasswordError.textContent = 'Las contraseñas no coinciden';
			} else {
				confirmPasswordError.textContent = '';
			}
		}
	});

	// Agregar validación cuando se pierde el foco en la confirmación de contraseña
	confirmPasswordInput.addEventListener('blur', function () {
		const confirmPassword = confirmPasswordInput.value;
		const newPassword = newPasswordInput.value;

		// Verificar si las contraseñas coinciden solo si hay texto
		if (confirmPassword.length > 0) {
			if (confirmPassword !== newPassword) {
				confirmPasswordError.textContent = 'Las contraseñas no coinciden';
			} else {
				confirmPasswordError.textContent = '';
			}
		}
	});

	// Limpiar mensajes de error cuando el usuario comienza a escribir
	newPasswordInput.addEventListener('input', function () {
		if (newPasswordInput.value.length >= 6) {
			newPasswordError.textContent = '';
		}

		// Si las contraseñas ahora coinciden, limpiar el error de confirmación
		if (
			newPasswordInput.value === confirmPasswordInput.value &&
			confirmPasswordInput.value.length > 0
		) {
			confirmPasswordError.textContent = '';
		} else if (confirmPasswordInput.value.length > 0) {
			// Si no coinciden y hay texto en el campo de confirmación, mostrar error
			confirmPasswordError.textContent = 'Las contraseñas no coinciden';
		}
	});

	confirmPasswordInput.addEventListener('input', function () {
		if (confirmPasswordInput.value === newPasswordInput.value) {
			confirmPasswordError.textContent = '';
		} else if (confirmPasswordInput.value.length > 0) {
			confirmPasswordError.textContent = 'Las contraseñas no coinciden';
		}
	});

	// Configurar cierre de los nuevos modales
	document.querySelectorAll('.modal .cerrar-modal').forEach((closeBtn) => {
		closeBtn.addEventListener('click', function () {
			this.closest('.modal').style.display = 'none';
		});
	});

	// Escuchar el evento de envío del formulario de login
	loginForm.addEventListener('submit', function (event) {
		// Código existente para el login
		// Prevenir el comportamiento predeterminado del formulario
		event.preventDefault();

		// Reiniciar mensajes de error
		usernameError.textContent = '';
		passwordError.textContent = '';
		captchaError.textContent = '';

		// Validar campo de usuario (email)
		if (usernameInput.value.trim() === '') {
			usernameError.textContent = 'Por favor, ingresa tu correo electrónico';
			return false;
		} else if (!isValidEmail(usernameInput.value.trim())) {
			usernameError.textContent = 'Por favor, ingresa un correo electrónico válido';
			return false;
		}

		// Validar campo de contraseña
		if (passwordInput.value.trim() === '') {
			passwordError.textContent = 'Por favor, ingresa tu contraseña';
			return false;
		}

		// Verificar captcha
		if (!isCaptchaCompleted()) {
			captchaError.textContent = 'Por favor, completa el captcha';
			// Aplicar efecto visual al contenedor del captcha
			const captchaContainer = document.querySelector('.g-recaptcha');
			captchaContainer.classList.add('captcha-error');
			captchaContainer.classList.add('shake-animation');

			// Quitar la clase de animación después de que termine
			setTimeout(() => {
				captchaContainer.classList.remove('shake-animation');
			}, 820);

			return false;
		} else {
			// Quitar la clase de error si el captcha está completado
			document.querySelector('.g-recaptcha').classList.remove('captcha-error');
		}

		// Función para sanitizar entradas
		function sanitizeInput(input) {
			// Eliminar caracteres potencialmente peligrosos
			return input.replace(/<|>|"|'|`|;|\\/g, '');
		}

		// Crear objeto con los datos del formulario
		const formData = {
			email: sanitizeInput(usernameInput.value.trim()),
			password: passwordInput.value,
		};

		// Deshabilitar botón para prevenir múltiples envíos
		submitBtn.disabled = true;
		submitBtn.classList.add('loading');

		// Enviar datos al servidor mediante fetch con timeout
		fetchWithTimeout(
			'/api/login',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			},
			8000
		)
			.then((response) => {
				// Clonar la respuesta para poder examinarla
				const responseClone = response.clone();

				return response.json().catch((err) => {
					// Si falla el parsing JSON, examinar el texto de la respuesta
					return responseClone.text().then((text) => {
						console.error('La respuesta no es JSON válido:', text);
						throw new Error('Respuesta del servidor no es JSON válido');
					});
				});
			})
			.then((data) => {
				if (data.success) {
					// Login exitoso
					if (data.redirect) {
						window.location.href = data.redirect;
					} else {
						mostrarModal('Inicio de sesión exitoso', true);
					}
				} else {
					// Error en el login
					mostrarModal('Información de inicio de sesión incorrecta', false);
					// Reiniciar el captcha
					grecaptcha.reset();
				}
			})
			.catch((error) => {
				console.error('Error de conexión:', error.name);
				if (error.message === 'Tiempo de espera agotado') {
					mostrarModal(
						'La solicitud ha tardado demasiado. Por favor, verifica tu conexión e intenta nuevamente.',
						false
					);
				} else {
					mostrarModal('Información de inicio de sesión incorrecta', false);
				}
				// Reiniciar el captcha
				grecaptcha.reset();
			})
			.finally(() => {
				// Habilitar botón nuevamente cuando la petición termine
				submitBtn.disabled = false;
				submitBtn.classList.remove('loading');
			});

		// Función para fetch con timeout
		function fetchWithTimeout(url, options, timeout = 10000) {
			return Promise.race([
				fetch(url, options),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error('Tiempo de espera agotado')), timeout)
				),
			]);
		}
	});

	// Validación en tiempo real para el campo de usuario (email)
	usernameInput.addEventListener('blur', function () {
		// Si el campo no está vacío pero el formato es incorrecto
		if (usernameInput.value.trim() !== '' && !isValidEmail(usernameInput.value.trim())) {
			usernameError.textContent = 'Por favor, ingresa un correo electrónico válido';
		} else {
			usernameError.textContent = '';
		}
	});

	// Validación en tiempo real para el campo de contraseña
	passwordInput.addEventListener('input', function () {
		if (passwordInput.value.trim() !== '') {
			passwordError.textContent = '';
		}
	});

	// Validación en tiempo real para el campo de email de recuperación
	recuperarEmailInput.addEventListener('blur', function () {
		if (recuperarEmailInput.value.trim() !== '' && !isValidEmail(recuperarEmailInput.value.trim())) {
			recuperarEmailError.textContent = 'Por favor, ingresa un correo electrónico válido';
		} else {
			recuperarEmailError.textContent = '';
		}
	});

	showPasswordBtns.forEach((btn) => {
		btn.addEventListener('click', (e) => {
			e.preventDefault(); // Evitar que el botón envíe el formulario

			// Encontrar el input de contraseña asociado (el anterior hermano)
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
