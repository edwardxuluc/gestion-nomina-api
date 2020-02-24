var express = require('express');
var router  = express.Router();
var Promise = require('bluebird');
var models  = require('../models');
var Schema = require('validate');

var validacion_usuario = new Schema({
    departamento_id: {
        type: Number,
        required: true,
        message: {
            required: 'No se ha defindo el departamento del emplado',
        }
    },
    numero_identificacion: {
        type: String,
        required: true,
        match: /^\S*$/,
        message: {
            required: 'No se ha definido el número de identificación del emplado',
            match: 'El número de identificación no debe tener espacios'
        },
    },
    nombre: {
        type: String,
        required: true,
        message: {
            required: 'No se ha definido el nombre del emplado',
        },
    },
    apellidos: {
        type: String,
        required: true,
        message: {
            required: 'No se ha definido el o los apellidos del emplado',
        },
    },
    direccion: {
        type: String,
        required: true,
        message: {
            required: 'No se ha definido la dirección del emplado',
        },
    },
    telefono: {
        type: String,
        required: true,
        // match: /^[0-9]\S*$/,
        message: {
            required: 'No se ha definido el teléfono del emplado',
            // match: 'El teléfono debe no tiene el formato requerido, solo numeros sin espacios',
        },
    },
});

var validacion_departamento = new Schema({
    nombre: {
        type: String,
        required: true,
        message: {
            required: 'No se ha definido el nombre del departamento'
        }
    }
})

var validar_numero_identificacion = function (numero_identificacion, empleadoId) {
    return new Promise(function (resolve, reject) {

        var criteria = {
            where: {
                numero_identificacion: numero_identificacion
            }
        };

        if (empleadoId) {
            criteria.where.id = {
                $ne: empleadoId
            }
        }

        models.Empleado.count(criteria).then(function (numero_empleados) {
            resolve(numero_empleados == 0 ? true : false);
        }).catch(function (error) {
            reject(error);
        });
    });
};

router.get('/', function(req, res, next){
    var response = {
        meta: {
            success: false,
            message: ''
        },
        data: {}
    };

    res.json('index');
});

router.get('/departamentos', function ( req, res, next ){ 
    
    var criteria = {
        where  : {},
        limit  : ( parseInt( req.query.count ) || 10 ),
        offset : ( parseInt( req.query.count ) || 10 ) * ( ( parseInt( req.query.page ) || 1 ) - 1 ),
        order  : [
            ['created_at', 'asc'],
        ]
    };

    if( req.query.filter ){
        if( req.query.filter['nombre'] ){
            criteria.where.nombre = {
                $like: `%${req.query.filter['nombre']}%`
            }
        }
    }

    models.Departamento.findAndCountAll( criteria ).then( function ( departamentoModels ){
        res.status(200).json({
            message: 'Deparamentos',
            data: departamentoModels
        });
    }).catch( function ( error ){
        res.status(500).json({
            message: `Ha ocurrido un error al consultar los departamentos. error: ${error.message}`
        });
    });    
});

router.post('/departamentos', function ( req, res, next ){ 

    var data = {
        nombre: req.body.nombre,
    };

    var errores = validacion_departamento.validate(data);

    if( !errores.length ){

        models.Departamento.create(data).then( function( departamentoModel ){
            res.status(201).json({
                message: 'Departamento creado correctamente',
            });
        }).catch( function ( error ){
            res.status(500).json({
                message: `Ha ocurrido un error al crear el departamento. error: ${error.message}`,
            });
        });
    }else{
        res.status(400).json({
            message: `Complete el formulario para continuar: ${errores[0].message}`
        });
    }
});

router.get('/departamentos/:id', function ( req, res, next ){ 
    
    models.Departamento.findById(req.params.id).then( function ( departamentoModel ){
        if (!departamentoModel){
            res.status(404).json({
                message: 'No se ha encontrado el departamento requerido'
            });
            return;
        }
        
        res.status(200).json({
            data: departamentoModel,
        });
    }).catch( function ( error ){
        res.status(500).json({
            message: `Ha ocurrido un error al consultar el departamento. error: ${error.message}`
        });
    });
});

router.put('/departamentos/:id', function ( req, res, next ){ 

    var data = {
        nombre: req.body.nombre,
    };

    var errores = validacion_departamento.validate(data);

    if (!errores.length) {

        models.Departamento.findById(req.params.id).then( function ( departamentoModel ){
            if (!departamentoModel){
                res.status(404).json({
                    message: 'No se ha encontrado el departamento requerido'
                });
                return;
            }

            return departamentoModel.update(data).then( function( departamentoModel ){
                res.status(200).json({
                    message: 'El departamento se ha actualizado correctamente'
                });
            });
        }).catch( function ( error ){
            res.status(500).json({
                message: `Ha ocurrido un error al actualizar el departamento. error: ${error.message}`,
            });
        });
    }else{
        res.status(400).json({
            message: `Complete el formulario para continuar: ${errores[0].message}`
        });
    }
});

router.delete('/departamentos/:id', function ( req, res, next ){
    var criteria = {
        where: {
            id: req.params.id
        }
    };

    models.Departamento.findOne(criteria).then( function ( departamentoModel ){
        if (!departamentoModel){
            res.status(404).json({
                message: 'No se ha encontrado el departamento requerido'
            });
            return;
        }

        return departamentoModel.destroy().then( function( result ){
            res.status(200).json({
                message: 'El departamento se ha eliminado correctamente'
            });
        });
    }).catch( function ( error ){
        res.status(500).json({
            message: error.name == 'SequelizeForeignKeyConstraintError' ? 'El departamento se encuentra relacionado a un empleado' : `Ha ocurrido un error al eliminar el departamento. error: ${error.message}`,
        });
    });
});


router.get('/empleados', function ( req, res, next ){ 
    var criteria = {
        where  : {},
        include: [
            { model : models.Departamento, attributes: ['id', 'nombre'] }
        ],
        limit  : ( parseInt( req.query.count ) || 10 ),
        offset : ( parseInt( req.query.count ) || 10 ) * ( ( parseInt( req.query.page ) || 1 ) - 1 ),
        order  : [
            ['created_at', 'asc'],
        ]
    };

    if( req.query.departamento_id ){
        criteria.where.departamento_id = req.query.departamento_id;
    }

    models.Empleado.findAndCountAll( criteria ).then( function ( empleadoModels ){
        res.status(200).json({
            message: 'Empleados',
            data: empleadoModels
        });
    }).catch( function ( error ){
        res.status(500).json({
            message: `Ha ocurrido un error al consultar los empleados. error: ${error.message}`,
        });
    });
});

router.post('/empleados', function ( req, res, next ){ 

    var data = {
        departamento_id       : !isNaN(req.body.departamento_id) ? parseInt(req.body.departamento_id) : null,
        numero_identificacion : req.body.numero_identificacion,
        nombre                : req.body.nombre,
        apellidos             : req.body.apellidos,
        direccion             : req.body.direccion,
        telefono              : req.body.telefono,
    };

    var errores = validacion_usuario.validate(data);

    if( !errores.length ){

        validar_numero_identificacion(req.body.numero_identificacion).then(function (numero_identificacion_valido){
            if( !numero_identificacion_valido ){
                res.status(409).json({
                    message: 'El número de identificación ingresado ya se encuentra registrado'
                });
                return;
            }

            return models.Empleado.create(data).then( function( empleadoModel ){
                res.status(201).json({
                    message: 'El emplado se ha guardado correctamente',
                });
            });
        }).catch(function (error) {
            res.status(500).json({
                message: `Ha ocurrido un error al guardar el empleado. error: ${error.message}`,
            });
        });
    }else{
        res.status(400).json({
            message: `Complete el formulario para continuar: ${errores[0].message}`
        });
    }
});

router.get('/empleados/:id', function ( req, res, next ){    
    models.Empleado.findById( req.params.id ).then( function ( empleadoModel ){
        if (!empleadoModel){
            res.status(404).json({
                message: 'No se ha encontrado el empleado requerido'
            });
            return;
        }

        res.status(200).json({
            message: 'Emplado',
            data: empleadoModel,
        });
    }).catch( function ( error ){
        res.status(500).json({
            message: `Ha ocurrido un erro al consultar el empleado. error: ${error.message}`
        });
    });
});

router.put('/empleados/:id', function (req, res, next) {

     var data = {
        departamento_id       : !isNaN(req.body.departamento_id) ? parseInt(req.body.departamento_id) : null,
        numero_identificacion : req.body.numero_identificacion,
        nombre                : req.body.nombre,
        apellidos             : req.body.apellidos,
        direccion             : req.body.direccion,
        telefono              : req.body.telefono,
    };

    var errores = validacion_usuario.validate(data);

    if (!errores.length) {

        models.Empleado.findById(req.params.id).then(function (empleadoModel) {
            if (!empleadoModel) {
                res.status(404).json({
                    message: 'No se ha encontrado el empleado requerido'
                });
                return;
            }

            return validar_numero_identificacion(req.body.numero_identificacion, empleadoModel.id).then(function(numero_identificacion_valido){
                if (!numero_identificacion_valido) {
                    res.status(409).json({
                        message: 'El número de identificación ingresado ya se encuentra registrado'
                    });
                    return;
                }

                return empleadoModel.update(data).then( function( empleadoModel ){
                    res.status(200).json({
                        message: 'El empleado se ha actualizado correctamente',
                        data: empleadoModel,
                    });
                });
            });
        }).catch(function (error) {
            res.status(500).json({
                message: `Ha ocurrido un erro al consultar el empleado. error: ${error.message}`
            });
        });
    } else {
        res.status(400).json({
            message: `Complete el formulario para continuar: ${errores[0].message}`
        });
    }
});

router.delete('/empleados/:id', function ( req, res, next ){ 
    
    models.Empleado.findById(req.params.id).then(function (empleadoModel) {
        if (!empleadoModel) {
            res.status(404).json({
                message: 'No se ha encontrado el empleado requerido'
            });
            return;
        }

        return empleadoModel.destroy().then( function( result ){
            res.status(200).json({
                message: 'El empleado se ha eliminado correctamente',
            });
        });
    }).catch(function (error) {
        res.status(500).json({
            message: `Ha ocurrido un erro al consultar el empleado. error: ${error.message}`
        });
    });
});

module.exports = ['/', router];