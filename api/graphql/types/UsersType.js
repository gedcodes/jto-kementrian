const {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLBoolean
  } = require('graphql');

  const UsersType = new GraphQLObjectType({
    name: 'Users',
    description: 'This represents a User',
    fields: () => ({
      id: {
        type: GraphQLInt,
        resolve: (user) => user.id,
      },
      nama_lengkap: {
        type: GraphQLString,
        resolve: (user) => user.nama_lengkap,
      },
      kontak_person: {
        type: GraphQLString,
        resolve: (user) => user.kontak_person,
      },      
      email: {
        type: GraphQLString,
        resolve: (user) => user.email,
      },
      last_login: {
        type: GraphQLString,
        resolve: (user) => user.last_login,
      },
      register_date: {
        type: GraphQLString,
        resolve: (user) => user.register_date,
      },            
      created_at: {
        type: GraphQLString,
        resolve: (user) => user.created_at,
      },
      updated_at: {
        type: GraphQLString,
        resolve: (user) => user.updated_at,
      },
      is_active: {
        type: GraphQLBoolean,
        resolve: (user) => user.is_active,
      },      
    }),
  });
  
  module.exports = { UsersType };  