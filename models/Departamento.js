/**
 * This is the model class for table "departamento".
 * Generator 1.2 for Express js sequelize by Edward Xuluc
**/

'use strict';

var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var Model  = sequelize.define('Departamento', {
        id : {
            field      : 'id',
            type       : DataTypes.BIGINT,
            allowNull  : false,
            primaryKey : true,
            autoIncrement : true,
        },
        nombre : {
            field      : 'nombre',
            type       : DataTypes.STRING(100),
            allowNull  : false,
        },
    },{
        classMethods: {
            associate: function( models ){
                Model.hasMany( models.Empleado, {
                    foreignKey: {
                        name: 'departamento_id',
                        allowNull: false,
                    }
                });
            }
        },
        tableName: 'departamento',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });
    return Model;
};