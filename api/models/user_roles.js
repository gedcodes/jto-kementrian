/* jshint indent: 2 */
const sequelizePaginate = require('sequelize-paginate')

module.exports = function(sequelize, DataTypes) {
  const UserRole = sequelize.define('user_roles', {
    'created_at': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "null"
    },
    'updated_at': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "null"
    },
    'roleId': {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "null",
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    'userId': {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "null",
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'user_roles',
    underscored: false
  });

  UserRole.associate = function (models) {
    // associations can be defined here
    UserRole.belongsTo(models.roles, {
      foreignKey: 'roleId',
      as: 'role'
    }); 
};

  sequelizePaginate.paginate(UserRole)

  return UserRole;  
};
