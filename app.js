require('dotenv').config();
var express      = require('express');
var path         = require('path');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cors         = require('cors');
var cls          = require('continuation-local-storage');
var namespace    = cls.createNamespace('my-namespace-transaction');
var Sequelize    = require('sequelize');
Sequelize.cls    = namespace;
var app          = express();
var fs           = require('fs');

app.use( cors() );

app.all('/*', function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
    next();
});

// view engine setup
app.engine('.html', require('jade').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');


// uncomment after placing your favicon in /public
app.use(morgan('dev'));
app.use(bodyParser.json({limit : '16mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.disable('x-powered-by');
app.disable('X-Frame-Options');

// cambiar texto null por null
app.use( function ( req, res, next ){
    console.log(req.body);
    console.log(req.query);
    Object.keys( req.body ).forEach( function ( attribute, index ){
        req.body[ attribute ] = req.body[ attribute ] == 'null' ? null : req.body[ attribute ];
    });
    
    next();
});

app.use('/public', express.static(__dirname + '/public'));

fs.readdirSync( './routes' ).map(function( file ){
    return file.split('.').slice(0, -1).join('.');
}).forEach( function ( file, index ){
    var route = require( './routes/' + file );
    if( typeof route == 'object' && route.length == 2 ){
        if( typeof route[0] == 'string' && typeof route[1] == 'function' ){
            app.use( route[0], route[1] );
            console.log( (index + 1) + '. Route Importado: ' + route[0] );
        }
    }
});

app.use(function( req, res, next ){
    var err = new Error( 'Pagina no encontrada :c' );
    err.status = 404;
    next(err);
});

if( app.get('env') === 'development' ){
    app.use( function ( err, req, res, next ){
        res.status( err.status || 500);
        res.json({
            message : err.message,
            error : err
        });
    });
}

module.exports = app;