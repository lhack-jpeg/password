if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const { response } = require('express');
const methodOverride = require('method-override');
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
app.use(methodOverride('_method'));

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
            // console.log(rows);
            // console.log('First item in array: ', rows[0]);
            res.render('show', { rows });
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
});

app.post('/', async (req, res) => {
    console.log(req.body.password);
    const { name, email_user, password, userID } = req.body.password;
    knex('passwords')
        .insert({
            password_name: name,
            email_username: email_user,
            pword: password,
            users_id: userID,
        })
        .then((results) => {
            knex.from('passwords')
                .select('*')
                .then((rows) => {
                    // console.log(rows);
                    // console.log('First item in array: ', rows[0]);
                    res.render('show', { rows });
                });
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
});

app.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email_user, password, userID } = req.body.password;
    console.log(id);
    const update = await knex('passwords').where({ id: id }).update({
        password_name: name,
        email_username: email_user,
        pword: password,
        users_id: userID,
    });
    if (update) {
        res.redirect(`/${id}`);
    } else {
        res.send('Failed to update');
    }
});

app.get('/add', (req, res) => {
    res.render('new');
});

app.get('/:id/edit', async (req, res) => {
    const { id } = req.params;
    const showOne = await knex.from('passwords').select('*').where('id', id);
    if (showOne) {
        let row = showOne[0];
        console.log(row);
        res.render('edit', { row });
    } else {
        res.status(404).send(body);
    }
});

app.get('/:id', async (req, res) => {
    const { id } = req.params;
    const showOne = knex
        .from('passwords')
        .select('*')
        .where('id', id)
        .then((result) => {
            console.log(result);
            let rowData = result[0];
            console.log('The single row: ', rowData);
            res.render('showOne', { rowData });
        });
});

const port = 3000 || process.env.PORT;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
