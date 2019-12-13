const express = require('express');
const router = express.Router();
const requireUsers =  require("../data/users")
const session = require('express-session');

router.post("/", async (req, res) => {
    let formData = req.body;
    let userEmail = formData.email;
    let pass = formData.password;
    let firstName = formData.fName;
    let lastName = formData.lName;
    
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
        res.render("user/signup", {error: "Error: Credentials do not match!", class:"error", title: "Login"})
    }
    else {
      res.render("user/signup", {error: "Email registered!", message: "Email already registered", class:"error"});
    }

    // try {
    //   if (!userEmail || !pass || !firstName || !lastName)
    //     throw "Error: Username, password, first name and last name cannot be empty!"
    //   if(userEmail == undefined || pass == undefined || firstName == undefined || lastName == undefined)
    //     throw "Error: Username, password, first name and last name cannot be undefined."
    // } catch (e) {
    //     res.render("user/login-form", {error: e, class:"error", title: "Login"})
    // }

});

module.exports = router;
