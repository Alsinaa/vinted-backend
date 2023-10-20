const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const salt = uid2(16);
    console.log("salt => ", salt);

    const hash = SHA256(req.body.password + salt).toString(encBase64);
    console.log("hash => ", hash);

    const token = uid2(64);
    console.log("token =>", token);
    const newUser = new User({
      account: { username: req.body.username },
      email: req.body.email,
      newsletter: req.body.newsletter,
      salt,
      hash,
      token,
    });

    const usermail = await User.findOne({ email: req.body.email });
    console.log(usermail);
    if (usermail) {
      return res.status(409).json({
        message: "user already created",
      });
    }
    if (!username) {
      return res.status(400).json({
        message: "Missing parameter",
      });
    } else {
      await newUser.save();
    }
    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const userLogin = await User.findOne({ email: req.body.email });
    console.log(userLogin);
    if (!userLogin) {
      return res.status(400).json({ message: "user does not exist" }); // vaut mieux mettre "Unauthorized"
    }
    const hash2 = SHA256(req.body.password + userLogin.salt).toString(
      encBase64
    );
    console.log(hash2);

    if (hash2 !== userLogin.hash) {
      return res.status(400).json({ message: "error password" }); // vaut mieux mettre "Unauthorized"
    } else {
      res.status(201).json({
        _id: userLogin._id,
        token: userLogin.token,
        account: userLogin.account,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
});
module.exports = router;
