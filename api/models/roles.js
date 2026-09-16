/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function(sequelize, DataTypes) {
  const Role = sequelize.define('roles', {
    'id': {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "null",
      primaryKey: true,
      autoIncrement: true
    },
    'kode': {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "null"
    },
    'nama': {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "null"
    },
    'created_at': {
      type: DataTypes.DATE,
      allowNull: true,
      //defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "null"
    },
    'updated_at': {
        type: DataTypes.DATE,
        allowNull: true,
        //defaultValue: sequelize.literal('NOW() ON UPDATE NOW()'),
        comment: "null"
    },  
    'deleted_at': {
        type: DataTypes.DATE,
        allowNull: true,
        //defaultValue: sequelize.literal('NOW() ON UPDATE NOW()'),
        comment: "null"
    },
    'is_active': {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: "null"
    },
    'is_deleted': {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: "null"
    },
    'deleted_by': {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "null"
    }
  }, {
    tableName: 'roles'
  });

  sequelizePaginate.paginate(Role)

  Role.associate  = function(models){

    Role.hasMany(models.privilage, {
      foreignKey: 'roles_id',
      as: 'roleprivilage'
    }); 
    
    Role.hasMany(models.Users, {
      foreignKey: 'role_id',
      as: 'userroles'
    });     
  }

  return Role;
};
