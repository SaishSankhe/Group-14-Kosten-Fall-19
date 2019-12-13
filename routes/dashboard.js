const express = require('express');
const router = express.Router();
const requireUsers = require("../data/users");
const requireSplit = require("../data/split");
const requireRequest = require("../data/request");

router.get("/", async (req, res) => {
    let userInfo = await requireUsers.getUser(req.session.userId);
    res.render("user/dashboard", {userInfo: userInfo, title: "Profile"});
});

router.get("/pending", async (req, res) => {
  let userId = req.session.userId;
  let splitPending = await requireSplit.checkSplitPending(userId);
  let requestPending = await requireRequest.checkPending(userId)
  res.render("user/pending", {splitPending: splitPending, requestPending: requestPending});
});

router.delete("/:id", async (req, res) => {
  let userId = req.params.id;
  let userInfo = await requireUsers.getUser(userId);
  let deleteUser = await requireUsers.deleteUser(userInfo.email);

  if (deleteUser === true)  {
    res.render("user/success", {title:"Account deleted", message: "Your account is deleted!"});
    req.session.destroy( err => {
      res.clearCookie("AuthCookie");
      res.render("user/logout", {title: "Logged out"});
    });
  }
  else 
    res.render("user/dashboard", {error:"Unsuccessful", class:"error", message: "Your account cannot be deleted!"});
});

module.exports = router;