'use strict';

var fs       = require("fs");
var path     = require("path");
var db       = {};
var conexion = require('../conexion');

fs.readdirSync( __dirname ).filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach( function( file, index ) {
    var modelo = conexion.import( path.join( __dirname, file ) );
    db[ modelo.name ] = modelo;
    console.log( (index + 1) + '. Modelo Importado: ' + modelo.name );
});

Object.keys(db).forEach(function(modelName){
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

module.exports = db;