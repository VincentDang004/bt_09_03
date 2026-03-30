var express = require("express");
var router = express.Router();

const bcrypt = require('bcrypt');

let { postUserValidator, validateResult } = require('../utils/validatorHandler');
let userController = require('../controllers/users');
let { checkLogin, checkRole } = require('../utils/authHandler.js');

let userModel = require("../schemas/users");


// ================= GET ALL =================
// admin + mod
router.get("/",
  checkLogin,
  checkRole("admin", "mod"),
  async function (req, res) {

    let users = await userModel
      .find({ isDeleted: false })
      .populate({
        path: 'role',
        select: "name"
      });

    res.send(users);
  }
);


// ================= GET BY ID =================
router.get("/:id",
  checkLogin,
  async function (req, res) {

    try {
      let result = await userModel.findOne({
        _id: req.params.id,
        isDeleted: false
      }).populate('role');

      if (result) {
        res.send(result);
      } else {
        res.status(404).send({ message: "id not found" });
      }

    } catch (error) {
      res.status(404).send({ message: "id not found" });
    }
  }
);


// ================= CREATE =================
// chỉ admin
router.post("/",
  checkLogin,
  checkRole("admin"),
  postUserValidator,
  validateResult,
  async function (req, res) {

    try {
      let hashedPassword = bcrypt.hashSync(req.body.password, 10);

      let newItem = await userController.CreateAnUser(
        req.body.username,
        hashedPassword,
        req.body.email,
        req.body.role
      );

      let saved = await userModel.findById(newItem._id).populate('role');

      res.send(saved);

    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }
);


// ================= UPDATE =================
// admin hoặc chính user đó
router.put("/:id",
  checkLogin,
  async function (req, res) {

    try {
      let id = req.params.id;

      let user = await userModel.findById(id);

      if (!user) {
        return res.status(404).send({ message: "id not found" });
      }

      // chỉ admin hoặc chính nó
      if (req.userId.toString() !== id) {
        let currentUser = await userController.FindUserById(req.userId);

        if (currentUser.role.name !== 'admin') {
          return res.status(403).send("ban khong co quyen");
        }
      }

      delete req.body._id;
      delete req.body.password;

      for (const key of Object.keys(req.body)) {
        user[key] = req.body[key];
      }

      await user.save();

      let populated = await userModel.findById(user._id).populate('role');

      res.send(populated);

    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }
);


// ================= DELETE =================
// chỉ admin
router.delete("/:id",
  checkLogin,
  checkRole("admin"),
  async function (req, res) {

    try {
      let id = req.params.id;

      let updatedItem = await userModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );

      if (!updatedItem) {
        return res.status(404).send({ message: "id not found" });
      }

      res.send(updatedItem);

    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }
);


// ================= CHANGE PASSWORD =================
router.post('/change-password',
  checkLogin,
  async (req, res) => {

    try {
      let { oldPassword, newPassword } = req.body;

      let user = await userController.FindUserById(req.userId);

      if (!user) {
        return res.status(404).send("user khong ton tai");
      }

      // so sánh bằng bcrypt
      if (!bcrypt.compareSync(oldPassword, user.password)) {
        return res.status(400).send("mat khau cu khong dung");
      }

      user.password = bcrypt.hashSync(newPassword, 10);
      await user.save();

      res.send("doi mat khau thanh cong");

    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);


module.exports = router;