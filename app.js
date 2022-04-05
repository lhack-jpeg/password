if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mysql = require('mysql');
const mysql2 = require('mysql2');
const { response } = require('express');
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'password_manager',
    },
});

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// connection.connect((err) => {
//     if (err) {
//         console.error('error connecting ' + err.stack);
//     }

//     console.log(`Connected via ${connection.threadId}`);
// });

app.get('/', async (req, res) => {
    const showRows = knex
        .from('passwords')
        .select('*')
        .then((results) => {
            console.log(results);
            console.log('First item in array: ', results[0]);
            res.render('show', { results });
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
});

app.get('/add', (req, res) => {
    res.render('new');
});

app.get('/:id', async (req, res) => {
    const { id } = req.params;
    const showOne = knex
        .from('passwords')
        .select('*')
        .where('id', id)
        .then((result) => {
            console.log(result);
            let rowData = { ...result[0] };
            console.log('The single row: ', rowData);
            res.render('showOne', { rowData });
        });
});

const port = 3000 || process.env.PORT;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
