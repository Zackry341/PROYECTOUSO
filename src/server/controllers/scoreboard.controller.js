const db = require('../db/connection');

const scoreboardController = {
    // Obtener puntajes (top 10)
    getScoreboard: (req, res) => {
        const query = 'SELECT nombre, score, difficulty FROM usuarios WHERE score IS NOT NULL ORDER BY score DESC LIMIT 10';

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error al obtener scoreboard:', error);
                return res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
            res.json({
                success: true,
                data: results
            });
        });
    },

    // Guardar/actualizar puntaje del usuario actual (solo si es mejor)
    saveScore: (req, res) => {
    try {
        const { score, difficulty } = req.body;
        const userId = req.session.userId;

        console.log('saveScore - Datos recibidos:', { score, difficulty, userId });

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }

        if (!score || score < 0) {
            return res.status(400).json({
                success: false,
                error: 'Score inválido'
            });
        }

        // Validar dificultad
        const validDifficulties = [1, 2, 3];
        const userDifficulty = difficulty || 1;

        if (!validDifficulties.includes(userDifficulty)) {
            return res.status(400).json({
                success: false,
                error: 'Dificultad inválida'
            });
        }

        // ✅ AGREGAR: Aplicar multiplicador según dificultad
        const difficultyMultipliers = {
            1: 1,  // Fácil: x1
            2: 3,  // Medio: x3
            3: 5   // Difícil: x5
        };

        const multiplier = difficultyMultipliers[userDifficulty];
        const finalScore = score * multiplier;

        console.log(`Score original: ${score}, Dificultad: ${userDifficulty}, Multiplicador: ${multiplier}, Score final: ${finalScore}`);

        // Obtener score actual del usuario
        const getScoreQuery = 'SELECT score, difficulty FROM usuarios WHERE id = ?';

        db.query(getScoreQuery, [userId], (error, results) => {
            if (error) {
                console.error('Error al obtener score actual:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener puntaje actual: ' + error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            const currentScore = results[0]?.score || 0;
            const currentDifficulty = results[0]?.difficulty || 1;

            // Solo actualizar si el nuevo puntaje es mayor
            if (finalScore > currentScore) {
                const updateQuery = 'UPDATE usuarios SET score = ?, difficulty = ? WHERE id = ?';

                db.query(updateQuery, [finalScore, userDifficulty, userId], (updateError, result) => {
                    if (updateError) {
                        console.error('Error al actualizar score:', updateError);
                        return res.status(500).json({
                            success: false,
                            error: 'Error al actualizar puntaje: ' + updateError.message
                        });
                    }

                    res.json({
                        success: true,
                        message: '¡Nuevo récord establecido!',
                        isNewRecord: true,
                        originalScore: score,
                        finalScore: finalScore,
                        difficulty: userDifficulty,
                        multiplier: multiplier,
                        previousScore: currentScore,
                        previousDifficulty: currentDifficulty,
                        difficultyName: getDifficultyName(userDifficulty)
                    });
                });
            } else {
                res.json({
                    success: true,
                    message: 'Puntaje registrado (no supera tu récord actual)',
                    isNewRecord: false,
                    originalScore: score,
                    finalScore: finalScore,
                    difficulty: userDifficulty,
                    multiplier: multiplier,
                    bestScore: currentScore,
                    bestDifficulty: currentDifficulty,
                    difficultyName: getDifficultyName(userDifficulty)
                });
            }
        });

    } catch (error) {
        console.error('Error general en saveScore:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor: ' + error.message
        });
    }
},

    // Limpiar todos los puntajes
    clearScoreboard: (req, res) => {
        try {

            db.query(query, (error) => {
                if (error) {
                    console.error('Error al limpiar scoreboard:', error);
                    return res.status(500).json({
                        success: false,
                        error: error.message
                    });
                }
                res.json({
                    success: true,
                    message: 'Scoreboard limpiado correctamente'
                });
            });
        } catch (error) {
            console.error('Error general en clearScoreboard:', error);
            return res.status(500).json({
                success: false,
                error: 'Error interno del servidor: ' + error.message
            });
        }
    },

    // Obtener score personal del usuario logueado
    getPersonalScore: (req, res) => {
        try {
            const userId = req.session.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
            }

            db.query(query, [userId], (error, results) => {
                if (error) {
                    console.error('Error al obtener score personal:', error);
                    return res.status(500).json({
                        success: false,
                        error: error.message
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Usuario no encontrado'
                    });
                }

                res.json({
                    success: true,
                    user: results[0]
                });
            });
        } catch (error) {
            console.error('Error general en getPersonalScore:', error);
            return res.status(500).json({
                success: false,
                error: 'Error interno del servidor: ' + error.message
            });
        }
    }
};

function getDifficultyName(difficulty) {
    const names = {
        1: 'Fácil',
        2: 'Medio',
        3: 'Difícil'
    };
    return names[difficulty] || 'Fácil';
}

module.exports = scoreboardController;
