const express = require('express');
const router = express.Router();
const session = require('express-session')
const data = require('../data');
const requireUsers = data.users;
const requireSplit = data.split;
const requireRequest = data.request;
const loginData = data.login;

router.get('/', async (req, res) => {
  res.render("user/login-form", {title: "Login"});
});

router.post('/', async (req, res) => {
  let credentials = req.body;
  let userEmail = credentials.email;
  let password = credentials.password;

  // try {
  //   if (!userEmail || !password)
  //     throw "Credentials cannot be left blank!";
  //   if (userEmail === null || password === null)
  //     throw "Credentials cannot be null!";
  // } catch (e) {
  //     res.render("somehandlebar/login", {errorMessage: e, title:"Check Credentials" , class: "error"});
  // }

  const checkPassword = await loginData.checkCredentials(userEmail, password);

  let userInfo = await requireUsers.getUser(checkPassword.userId);

  if (checkPassword.compare === true) {
    req.session.name = 'AuthCookie';
    req.session.userId = checkPassword.userId;
    res.redirect("/dashboard");
  }
  else {
    res.status(401).render("user/login-form", {errorMessage: "Credentials incorrect!", title: "Incorrect Credentials", class: "error"});
  }
});

module.exports = router;