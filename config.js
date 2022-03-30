if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
module.exports = {
    database: {
        host: 'localhost',
        port: 3030,
        user: process.env.DB_USER,
        password: '',
        database: 'password_manager',
    },
};
