const db = require('../db/connection');

const difficultyController = {
    saveDifficulty: (req, res) => {
        try {
            const { difficulty } = req.body;
            const userId = req.session.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            if (![1, 2, 3].includes(difficulty)) {
                return res.status(400).json({
                    success: false,
                    message: 'Dificultad inválida'
                });
            }

            const query = 'UPDATE usuarios SET difficulty = ? WHERE id = ?';
            
            db.query(query, [difficulty, userId], (error, results) => {
                if (error) {
                    console.error('Error al guardar dificultad:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor'
                    });
                }

                res.json({
                    success: true,
                    message: 'Dificultad guardada correctamente',
                    difficulty: difficulty
                });
            });

        } catch (error) {
            console.error('Error al guardar dificultad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    getDifficulty: (req, res) => {
        try {
            const userId = req.session.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const query = 'SELECT difficulty FROM usuarios WHERE id = ?';
            
            db.query(query, [userId], (error, results) => {
                if (error) {
                    console.error('Error al obtener dificultad:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor'
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }

                res.json({
                    success: true,
                    difficulty: results[0].difficulty || 1
                });
            });

        } catch (error) {
            console.error('Error al obtener dificultad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
};

module.exports = difficultyController;
