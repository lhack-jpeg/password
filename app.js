if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const { response } = require('express');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const bodyParser = require('body-parser');
const mysqlStore = require('express-mysql-session')(session);
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    pool: { min: 0, max: 10 },
});

const app = express();

const options = {
    connectionLimit: 10,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    createDatabaseTable: true,
};

const sessionStore = new mysqlStore(options);

const sessionConfig = {
    saveUninitialized: true,
    resave: false,
    secret: process.env.SECRET,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 2, // 2 hours
        sameSite: true,
    },
};

if (process.env.NODE_ENV !== 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sessionConfig.cookie.secure = true; // serve secure cookies
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(new LocalStrategy());

app.get('/', (req, res) => {
    res.render('home');
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

app.post('/login', (req, res) => {
    res.send(req.body);
});

app.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email_user, password, userID } = req.body.password;
    const updateTime = new Date().toISOString().slice(0, 19);
    console.log(id);
    const update = await knex('passwords').where({ id: id }).update({
        password_name: name,
        email_username: email_user,
        pword: password,
        users_id: userID,
        updated_at: updateTime,
    });
    if (update) {
        res.redirect(`/${id}`);
    } else {
        res.send('Failed to update');
    }
});

app.get('/passwords', async (req, res) => {
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

app.get('/add', (req, res) => {
    res.render('new');
});

app.get('/passwords/:id/edit', async (req, res) => {
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

app.get('/passwords/:id', async (req, res) => {
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

app.delete('/passwords/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletePassword = await knex('passwords').where({ id: id }).del();
        if (deletePassword) {
            try {
                const rows = await knex.from('passwords').select('*');
                if (rows) {
                    res.render('show', { rows });
                } else {
                    res.status(404);
                }
            } catch (err) {
                res.send(err);
            }
        } else {
            res.status(404);
        }
    } catch (err) {
        res.send(err);
    }
});

const port = 3000 || process.env.PORT;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
