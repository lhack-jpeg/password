if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mysql = require('mysql');
const mysql2 = require('mysql2');

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'password_manager',
});

connection.connect((err) => {
    if (err) {
        console.error('error connecting ' + err.stack);
    }

    console.log(`Connected via ${connection.threadId}`);
});

app.get('/', (req, res) => {
    res.send('Sever is active');
});

const port = 3000 || process.env.PORT;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
