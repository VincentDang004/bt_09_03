let jwt = require('jsonwebtoken');
let userController = require('../controllers/users');

module.exports = {

    // CHECK LOGIN
    checkLogin: async function (req, res, next) {
        try {
            let token;

            // lấy từ cookie
            if (req.cookies && req.cookies.token) {
                token = req.cookies.token;
            } 
            // lấy từ header
            else {
                token = req.headers.authorization;

                if (!token || !token.startsWith("Bearer")) {
                    return res.status(403).send("ban chua dang nhap");
                }

                token = token.split(' ')[1];
            }

            // verify token
            let result = jwt.verify(token, 'secret');

            if (!result || result.exp * 1000 <= Date.now()) {
                return res.status(403).send("token het han");
            }

            // gán userId cho request
            req.userId = result.id;

            next();

        } catch (err) {
            return res.status(401).send("token khong hop le");
        }
    },


    // CHECK ROLE
    checkRole: function (...requiredRole) {
        return async function (req, res, next) {
            try {
                let userId = req.userId;
                let user = await userController.FindUserById(userId);

                if (!user) {
                    return res.status(401).send("khong tim thay user");
                }

                let currentRole = user.role.name;

                // admin full quyền
                if (currentRole === 'admin') {
                    return next();
                }

                // role thường
                if (requiredRole.includes(currentRole)) {
                    return next();
                }

                return res.status(403).send("ban khong co quyen");

            } catch (err) {
                return res.status(500).send("loi server");
            }
        }
    }
}