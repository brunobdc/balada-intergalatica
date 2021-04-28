var Pool = require('pg').Pool

module.exports = new Pool({
    user: 'master',
    host: 'localhost',
    database: 'balada_intergalatica',
    password: 'masterpass',
    port: 5432,
});