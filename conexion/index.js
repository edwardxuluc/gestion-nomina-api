'use strict';

var Sequelize = require('sequelize');
var chalk     = require('chalk');

var conexion = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        logging : process.env.DB_LOGGING == true || process.env.DB_LOGGING == 'true' ? console.log : false,
        host    : process.env.DB_HOST,
        dialect : process.env.DB_DIALECT,
        port    : process.env.DB_PORT,
    }
);

conexion.authenticate().then(() => {
    console.log( chalk.green('Conexion establecida con la base de datos') );
}).catch(error => {
    console.log( chalk.red( 'Ha ocurrido un error al conectar la base de datos. error: ' + error.message ) );
});

module.exports = conexion;