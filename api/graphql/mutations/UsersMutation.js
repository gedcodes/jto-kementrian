const merge = require('lodash.merge');

const { UsersType } = require('../types');
const { User } = require('../../models/users');
const { UserInputType } = require('../inputTypes');
  

const updateUser = {
  type: UsersType,
  description: 'The mutation that allows you to update an existing User by Id',
  args: {
    user: {
      name: 'user',
      type: UserInputType('update'),
    },
  },
  resolve: async (_, { user }) => {
    const foundUser = await User.findByPk(user.id);

    if (!foundUser) {
      throw new Error(`User with id: ${user.id} not found!`);
    }

    const updatedUser = merge(foundUser, {
      nama_lengkap: user.nama_lengkap,
      kontak_person: user.kontak_person,
      email: user.email,
    });

    return foundUser.update(updatedUser);
  },
};

const deleteUser = {
  type: UsersType,
  description: 'The mutation that allows you to delete a existing User by Id',
  args: {
    user: {
      name: 'user',
      type: UserInputType('delete'),
    },
  },
  resolve: async (_, { user }) => {
    const foundUser = await User.findByPk(user.id);

    if (!foundUser) {
      throw new Error(`User with id: ${user.id} not found!`);
    }

    await User.destroy({
      where: {
        id: user.id,
      },
    });

    return foundUser;
  },
};

module.exports = {
  updateUser,
  deleteUser,
};
