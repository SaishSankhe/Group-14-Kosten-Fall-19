const express = require('express');
const router = express.Router();
const session = require('express-session')
const data = require('../data');
const requireUsers = data.users;
const requireSplit = data.split;
const requireRequest = data.request;
const loginData = data.login;

router.get('/', async (req, res) => {
  res.render("user/login-form", {title: "Login", loginActive: "active"});
});

router.post('/', async (req, res) => {
  let credentials = req.body;
  let userEmail = credentials.email.toLowerCase().trim();
  let password = credentials.password;

  // check if username and password are entered
  try {
    if (!userEmail || !password)
      throw "Credentials cannot be left blank!";
    if (userEmail === null || password === null)
      throw "Credentials cannot be null!";
  } catch (e) {
      return res.render("user/login-form", {error: e, title:"Check Credentials" , class: "error", loginActive: "active"});
  }

  // check if user is registered
  let userId;
  try {
    userId = await requireUsers.getUserByEmail(userEmail);
    if (!userId) {
      throw "User not found!"
    }
  } catch (e) {
    return res.render("user/login-form", {error: e, title: "User not found.", class: "error", loginActive: "active"})
  }

  let checkPassword;
  try {
    checkPassword = await loginData.checkCredentials(userEmail, password);
  } catch (e) {
    return res.render("user/login-form", {error: e, title: "Credentials Error", class: "error", loginActive: "active"});
  }

  if (checkPassword.compare === true) {
    req.session.name = 'AuthCookie';
    req.session.userId = checkPassword.userId;
    res.redirect("/dashboard");
  }
  else {
    return res.status(401).render("user/login-form", {error: "Credentials incorrect!", title: "Incorrect Credentials", class: "error", loginActive: "active"});
  }
});

module.exports = router;