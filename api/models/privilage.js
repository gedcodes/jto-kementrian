/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const privilage = sequelize.define('privilage', {
    'id': {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "null",
      primaryKey: true,
      autoIncrement: true
    },
    'permission_menu_id': {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "null",
      references: {
        model: 'permission_menu',
        key: 'id'
      }
    },
    'roles_id': {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "null",
      references: {
        model: 'roles',
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
    tableName: 'privilage'
  });

  privilage.associate  = function(models){
    privilage.belongsTo(models.permission_menu, {
      foreignKey: 'permission_menu_id',
      as : 'privilagepermission'
    });   
  }

  return privilage
};
