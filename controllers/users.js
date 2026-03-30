const userModel = require('../schemas/users');
const bcrypt = require('bcrypt');

module.exports = {
    CreateAnUser: async function (
        username, password, email, role,
        avatarUrl, fullName, status, loginCount
    ) {
        let newUser = new userModel({
            username,
            password,
            email,
            role,
            avatarUrl,
            fullName,
            status,
            loginCount
        });

        await newUser.save();
        return newUser;
    },

    QueryByUserNameAndPassword: async function (username, password) {
        let getUser = await userModel.findOne({ username });

        if (!getUser) return false;

        if (bcrypt.compareSync(password, getUser.password)) {
            return getUser;
        }

        return false;
    },

    FindUserById: async function (id) {
        return await userModel.findOne({
            _id: id,
            isDeleted: false
        }).populate('role');
    },

    FindUserByEmail: async function (email) {
        return await userModel.findOne({
            email,
            isDeleted: false
        });
    },

    FindUserByToken: async function (token) {
        let user = await userModel.findOne({
            forgotpasswordToken: token,
            isDeleted: false
        });

        if (!user || user.forgotpasswordTokenExp < Date.now()) {
            return false;
        }

        return user;
    }
};