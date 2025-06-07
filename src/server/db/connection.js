const mysql = require('mysql2');
require('dotenv').config();

let connection;

// Si estamos en Heroku, usar JAWSDB_URL
if (process.env.JAWSDB_URL) {
    connection = mysql.createConnection(process.env.JAWSDB_URL);
} else {
    // Configuración local
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
}

// Manejar errores de conexión
connection.on('error', function(err) {
    console.error('Error de conexión MySQL:', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reconectando a MySQL...');
        // Aquí podrías implementar lógica de reconexión
    } else {
        throw err;
    }
});

connection.connect((error) => {
    if (error) {
        console.error('Error al conectar a la base de datos MySQL:', error);
        return;
    }
    console.log('Conexión establecida con la base de datos MySQL');
});

module.exports = connection;
