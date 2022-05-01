const passport = require('passport');
const mysql = require('mysql2');
const LocalStrategy = require('passport-local').Strategy;
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        connection.query(
            'select * from users where id = ' + id,
            function (err, rows) {
                done(err, rows[0]);
            }
        );
    });

    passport.use(
        'local-signup',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true,
            },
            function (req, email, password, done) {
                connection.query(
                    "select * from users where email = '" + email + "'",
                    function (err, rows) {
                        console.log(rows);
                        console.log('above row obnject');
                        if (err) return done(err);
                        if (rows.length) {
                            return done(null, false);
                        } else {
                        }
                    }
                );
            }
        )
    );
};
