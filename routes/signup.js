const express = require('express');
const router = express.Router();
const requireUsers =  require("../data/users")
const session = require('express-session');

router.get('/', async (req, res) => {
  res.render("user/signup", {title: "Sign Up", signupActive: "active"});
});

router.post("/", async (req, res) => {
    let formData = req.body;
    let userEmail = formData.email.toLowerCase().trim();
    let pass = formData.password;
    let firstName = formData.fName.trim();
    let lastName = formData.lName.trim();
    
    let checkUser = await requireUsers.getUserByEmail(userEmail);

    if (checkUser === false) {
      let userDetails = {
        fName: firstName,
        lName: lastName,
        email: userEmail,
        password: pass,
      }

      let userObj = await requireUsers.addUser(userDetails);
      
      if (userObj.flag === true) {
        let userInfo = await requireUsers.getUser(userObj.userId);
        req.session.userId = userObj.userId;
        req.session.name = "AuthCookie";
        res.render("user/dashboard", {userInfo: userInfo});
      }
      else
        res.render("user/signup", {error: "Credentials provided do not match!", class:"error", title: "Login", signupActive: "active"})
    }
    else {
      res.render("user/signup", {error: "Email registered!", message: "Email already registered", class:"error", signupActive: "active"});
    }

});

module.exports = router;
