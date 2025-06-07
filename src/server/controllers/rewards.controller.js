const db = require('../db/connection');

const rewardsController = {
	claimReward: (req, res) => {
		try {
			const { score, bet, difficulty } = req.body;
			const userId = req.session.userId;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: 'Usuario no autenticado',
				});
			}

			if (!score || !bet || score <= 0 || bet <= 0) {
				return res.status(400).json({
					success: false,
					message: 'Datos inválidos',
				});
			}

			// Obtener dificultad del usuario
			const getUserQuery = 'SELECT difficulty, credits FROM usuarios WHERE id = ?';

			db.query(getUserQuery, [userId], (error, results) => {
				if (error) {
					console.error('Error al obtener usuario:', error);
					return res.status(500).json({
						success: false,
						message: 'Error interno del servidor',
					});
				}

				if (results.length === 0) {
					return res.status(404).json({
						success: false,
						message: 'Usuario no encontrado',
					});
				}

				const user = results[0];
				const userDifficulty = difficulty || user.difficulty || 1;
				const currentCredits = user.credits || 0;

				// Calcular multiplicador según dificultad
				const difficultyMultipliers = {
                1: 1,  // Fácil: x1
                2: 3,  // Medio: x3
                3: 5   // Difícil: x5
            };

			const multiplier = difficultyMultipliers[userDifficulty];

				// Calcular créditos ganados: (apuesta × dificultad) + puntuación
				const finalScore = score * multiplier;
				const creditsEarned = bet + finalScore;
				const newBalance = currentCredits + creditsEarned;

				// Actualizar créditos del usuario
				const updateQuery = 'UPDATE usuarios SET credits = ? WHERE id = ?';

				db.query(updateQuery, [newBalance, userId], (updateError) => {
					if (updateError) {
						console.error('Error al actualizar créditos:', updateError);
						return res.status(500).json({
							success: false,
							message: 'Error al procesar recompensa',
						});
					}

					res.json({
						success: true,
                message: 'Recompensa reclamada exitosamente',
                score: finalScore, 
                originalScore: score, 
                bet: bet,
                difficulty: userDifficulty,
                multiplier: multiplier, 
                creditsEarned: creditsEarned,
                previousBalance: currentCredits,
                newBalance: newBalance,
					});
				});
			});
		} catch (error) {
			console.error('Error general en claimReward:', error);
			return res.status(500).json({
				success: false,
				message: 'Error interno del servidor',
			});
		}
	},
};

module.exports = rewardsController;
