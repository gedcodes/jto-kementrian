/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
	const t_menu = sequelize.define('t_menu', {
		'id': {
			type: DataTypes.INTEGER,
			allowNull: false,
			comment: "null",
			primaryKey: true,
			autoIncrement: true
		},
		'parent_id': {
			type: DataTypes.INTEGER,
			allowNull: true,
			comment: "null"
		},
		'title': {
			type: DataTypes.STRING,
			allowNull: true,
			comment: "null"
		},
		'path': {
			type: DataTypes.STRING,
			allowNull: true,
			comment: "null"
		},
		'icon': {
			type: DataTypes.STRING,
			allowNull: true,
			comment: "null"
		},
		'group': {
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: false,
			comment: "null"
		},
		'is_active': {
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: true,
			comment: "null"
		},
		'no_urut': {
			type: DataTypes.INTEGER,
			allowNull: true,
			comment: "null"
		},
		'alias': {
			type: DataTypes.STRING,
			allowNull: true,
			comment: "null"
		},
	}, {
		tableName: 't_menu',
		timestamps: false,
	});

	t_menu.associate = function (models) {

		t_menu.hasMany(models.permission_menu, {
			foreignKey: 'menu_id',
			as: 'menupermission'
		});
	}

	return t_menu
};
