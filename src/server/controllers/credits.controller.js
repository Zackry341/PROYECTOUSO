const db = require('../db/connection');

const creditsController = {
    // Obtener créditos actuales del usuario
    getCredits: (req, res) => {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const query = 'SELECT credits FROM usuarios WHERE id = ?';
        
        db.query(query, [userId], (error, results) => {
            if (error) {
                console.error('Error al obtener créditos:', error);
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
                credits: results[0].credits || 0
            });
        });
    },

    // Agregar créditos al usuario
    addCredits: (req, res) => {
        const { amount, bonus = 0, price, packageName } = req.body;
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Cantidad de créditos inválida'
            });
        }

        // Obtener créditos actuales
        const getCurrentCreditsQuery = 'SELECT credits FROM usuarios WHERE id = ?';
        
        db.query(getCurrentCreditsQuery, [userId], (error, results) => {
            if (error) {
                console.error('Error al obtener créditos actuales:', error);
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
            
            const currentCredits = results[0].credits || 0;
            const totalCreditsToAdd = parseInt(amount) + parseInt(bonus);
            const newBalance = currentCredits + totalCreditsToAdd;
            
            // Actualizar créditos
            const updateQuery = 'UPDATE usuarios SET credits = ? WHERE id = ?';
            
            db.query(updateQuery, [newBalance, userId], (updateError) => {
                if (updateError) {
                    console.error('Error al actualizar créditos:', updateError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al procesar la compra'
                    });
                }
                
                // Opcional: Registrar la transacción en una tabla de historial
                // insertTransaction(userId, amount, bonus, price, packageName);
                
                res.json({
                    success: true,
                    message: 'Créditos agregados exitosamente',
                    creditsAdded: totalCreditsToAdd,
                    previousBalance: currentCredits,
                    newBalance: newBalance,
                    transaction: {
                        baseCredits: amount,
                        bonusCredits: bonus,
                        price: price,
                        package: packageName
                    }
                });
            });
        });
    },

    // Usar créditos (para cuando el usuario juegue)
    useCredits: (req, res) => {
        const { amount } = req.body;
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Cantidad de créditos inválida'
            });
        }

        // Verificar que el usuario tenga suficientes créditos
        const getCurrentCreditsQuery = 'SELECT credits FROM usuarios WHERE id = ?';
        
        db.query(getCurrentCreditsQuery, [userId], (error, results) => {
            if (error) {
                console.error('Error al obtener créditos:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor'
                });
            }
            
            const currentCredits = results[0]?.credits || 0;
            
            if (currentCredits < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Créditos insuficientes',
                    currentCredits: currentCredits,
                    required: amount
                });
            }
            
            const newBalance = currentCredits - amount;
            
            // Actualizar créditos
            const updateQuery = 'UPDATE usuarios SET credits = ? WHERE id = ?';
            
            db.query(updateQuery, [newBalance, userId], (updateError) => {
                if (updateError) {
                    console.error('Error al usar créditos:', updateError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al procesar el uso de créditos'
                    });
                }
                
                res.json({
                    success: true,
                    message: 'Créditos utilizados exitosamente',
                    creditsUsed: amount,
                    newBalance: newBalance
                });
            });
        });
    }
};

module.exports = creditsController;
