const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'HP',   // Replace with your database username
    password: '6122004',   // Replace with your database password
    database: 'stud'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// API to get student data
app.get('/api/students', (req, res) => {
    const query = `SELECT * FROM student1`;
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
