const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cashcash'
});

connection.connect(err => {
    if (err) {
        console.error('MySQL connection failed:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

module.exports = connection;