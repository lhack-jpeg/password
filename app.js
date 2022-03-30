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
        .then((rows) => {
            for (row of rows) {
                res.send(row);
            }
        })
        .catch((err) => {
            console.log(err);
            throw err;
        })
        .finally(() => {
            knex.destroy();
        });
});

const port = 3000 || process.env.PORT;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
