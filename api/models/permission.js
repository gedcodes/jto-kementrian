/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const permission = sequelize.define('permission', {
    'id': {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "null",
      primaryKey: true,
      autoIncrement: true
    },
    'name': {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "null"
    },
    'alias': {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "null"
    },
    'is_active': {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: "null"
    }
  }, {
    tableName: 'permission',
    timestamps: false
  });

  return permission
};
