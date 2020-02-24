/**
 * This is the model class for table "empleado".
 * Generator 1.2 for Express js sequelize by Edward Xuluc
**/

'use strict';

var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var Model  = sequelize.define('Empleado', {
        id : {
            field      : 'id',
            type       : DataTypes.BIGINT,
            allowNull  : false,
            primaryKey : true,
            autoIncrement : true,
        },
        departamento_id : {
            field      : 'departamento_id',
            type       : DataTypes.BIGINT,
            allowNull  : false,
        },
        numero_identificacion : {
            field      : 'numero_identificacion',
            type       : DataTypes.STRING(100),
            allowNull  : false,
        },
        nombre : {
            field      : 'nombre',
            type       : DataTypes.STRING(100),
            allowNull  : false,
        },
        apellidos : {
            field      : 'apellidos',
            type       : DataTypes.STRING(100),
            allowNull  : false,
        },
        direccion : {
            field      : 'direccion',
            type       : DataTypes.TEXT,
            allowNull  : false,
        },
        telefono : {
            field      : 'telefono',
            type       : DataTypes.STRING(20),
            allowNull  : false,
        },
    },{
        classMethods: {
            associate: function( models ){
                Model.belongsTo( models.Departamento, {
                    foreignKey: {
                        name: 'departamento_id',
                        allowNull: false,
                    }
                });
            }
        },
        tableName: 'empleado',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });
    return Model;
};