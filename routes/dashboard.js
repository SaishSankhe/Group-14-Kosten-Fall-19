const express = require('express');
const router = express.Router();
const requireUsers = require("../data/users");
const requireSplit = require("../data/split");
const requireRequest = require("../data/request");
const requireTransactions = require("../data/transactions");

router.get("/", async (req, res) => {

  let userInfo;

  // check if user found
  try {
    userInfo = await requireUsers.getUser(req.session.userId);
    if (!userInfo) {
        throw "User not found!"
    }
  } catch (e) {
      return res.render("user/error", {error: e, title:"User Not Found" , class: "error"});
  }

  let splitPending;
  // check if split pending found
  try {
    splitPending = await requireSplit.checkSplitPending(userInfo._id);
    if (!splitPending) {
        throw "Pending splits not found!"
    }
  } catch (e) {
      return res.render("user/error", {error: e, title:"Pending Splits Not Found" , class: "error"});
  }

  let requestPending;
  // check if split pending found
  try {
    requestPending = await requireRequest.checkPending(userInfo._id);
    if (!requestPending) {
        throw "Pending requests not found!"
    }
  } catch (e) {
      return res.render("user/error", {error: e, title:"Pending Requests Not Found" , class: "error"});
  }

  let recentTransactions;
  // check if recent transactions found
  try {
    recentTransactions = await requireTransactions.recentTransactions(userInfo._id);
    if (!recentTransactions) {
        throw "Recent transactions not found!"
    }
  } catch (e) {
      return res.render("user/error", {error: e, title:"Recent Transaction Not Found" , class: "error"});
  }

  let amount = parseFloat(userInfo.currentAmount).toFixed(2);
  userInfo.currentAmount = amount.toString();
  res.render("user/dashboard", {userInfo: userInfo, recentTransactions: recentTransactions, splitPending: splitPending, requestPending: requestPending, title: "Profile", dashActive: "active"});
});

router.get("/pending", async (req, res) => {
  let userId = req.session.userId;
  let splitPending;

  // check if split pending found
  try {
    splitPending = await requireSplit.checkSplitPending(userId);
    if (!splitPending) {
        throw "Pending splits not found!"
    }
  } catch (e) {
      return res.render("user/error", {error: e, title:"Pending Splits Not Found" , class: "error"});
  }

  let requestPending;

  // check if split pending found
  try {
    requestPending = await requireRequest.checkPending(userId);
    if (!requestPending) {
        throw "Pending requests not found!"
    }
  } catch (e) {
      return res.render("user/error", {error: e, title:"Pending Requests Not Found" , class: "error"});
  }
  
  res.render("user/pending", {splitPending: splitPending, requestPending: requestPending, pendingActive: "active"});
});

router.delete("/:id", async (req, res) => {
  let userId = req.params.id;
  let userInfo;
  let deleteUser

  try {
    userInfo = await requireUsers.getUser(userId);
    deleteUser = await requireUsers.deleteUser(userInfo.email);
  } catch (e) {
      return res.render("user/error", {error: e, title:"User Error" , class: "error"});
  }

  if (deleteUser === true)  {
    res.render("user/success", {title:"Account deleted", message: "Your account is deleted!", dashActive: "active"});
    req.session.destroy( err => {
      res.clearCookie("AuthCookie");
      res.render("user/logout", {title: "Logged out"});
    });
  }
  else 
    res.render("user/dashboard", {error:"Unsuccessful", class:"error", message: "Your account cannot be deleted!", dashActive: "active"});
});

module.exports = router;