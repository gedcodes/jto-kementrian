/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const permission_menu = sequelize.define('permission_menu', {
    'id': {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "null",
      primaryKey: true,
      autoIncrement: true
    },
    'menu_id': {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "null",
      references: {
        model: 't_menu',
        key: 'id'
      }
    },
    'permission_id': {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "null",
      references: {
        model: 'permission',
        key: 'id'
      }
    },
    'created_at': {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "null"
    },
    'updated_at': {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "null"
    }
  }, {
    tableName: 'permission_menu'
  });

  permission_menu.associate  = function(models){
    permission_menu.belongsTo(models.permission, {
      foreignKey: 'permission_id',
      as : 'permission'
    });   

    permission_menu.belongsTo(models.t_menu, {
      foreignKey: 'menu_id',
      as : 'menu'
    });   
  }

  return permission_menu
};
