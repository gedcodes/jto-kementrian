const {
	GraphQLInt,
	GraphQLString,
	GraphQLList,
	GraphQLBoolean,
} = require('graphql');

const { UsersType } = require('../types');
const { Users } = require('../../models/');
const UsersController = require('../../controllers/UsersController');

const usersQuery = {
	type: new GraphQLList(UsersType),
	args: {
		id: {
			name: 'id',
			type: GraphQLInt,
		},
		email: {
			name: 'email',
			type: GraphQLString,
		},
		nama_lengkap: {
			name: 'nama_lengkap',
			type: GraphQLString,
		},
		kontak_person: {
			name: 'kontak_person',
			type: GraphQLString,
		},
		last_login: {
			name: 'last_login',
			type: GraphQLString,
		},
		register_date: {
			name: 'register_date',
			type: GraphQLString,
		},
		created_at: {
			name: 'created_at',
			type: GraphQLString,
		},
		updated_at: {
			name: 'updated_at',
			type: GraphQLString,
		},
		is_active: {
			name: 'is_active',
			type: GraphQLBoolean,
		},
	},
	//resolve: (user, args) => UsersController.findAll,  
	resolve: (user, args) => Users.findAll({ where: args, logging: false }),
};

module.exports = { usersQuery };