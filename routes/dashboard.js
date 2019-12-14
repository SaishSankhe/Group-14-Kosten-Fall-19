const express = require('express');
const router = express.Router();
const requireUsers = require("../data/users");
const requireSplit = require("../data/split");
const requireRequest = require("../data/request");
const requireTransactions = require("../data/transactions");

router.get("/", async (req, res) => {
    let userInfo = await requireUsers.getUser(req.session.userId);
    // check if user found
    try {
      if (!userInfo) {
          throw "User not found!"
      }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"User Not Found" , class: "error"});
    }

    let splitPending = await requireSplit.checkSplitPending(userInfo._id);
    // check if split pending found
    try {
      if (!splitPending) {
          throw "Pending splits not found!"
      }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"Pending Splits Not Found" , class: "error"});
    }

    let requestPending = await requireRequest.checkPending(userInfo._id);
    // check if split pending found
    try {
      if (!requestPending) {
          throw "Pending requests not found!"
      }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"Pending Requests Not Found" , class: "error"});
    }

    let recentTransactions = await requireTransactions.recentTransactions(userInfo._id);
    // check if recent transactions found
    try {
      if (!recentTransactions) {
          throw "Recent transactions not found!"
      }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"Recent Transaction Not Found" , class: "error"});
    }

    let amount = parseFloat(userInfo.currentAmount).toFixed(2);
    userInfo.currentAmount = amount.toString();
    res.render("user/dashboard", {userInfo: userInfo, recentTransactions: recentTransactions, splitPending: splitPending, requestPending: requestPending, title: "Profile", dashActive: "active"});
});

router.get("/pending", async (req, res) => {
  let userId = req.session.userId;
  let splitPending = await requireSplit.checkSplitPending(userId);
  // check if split pending found
  try {
    if (!splitPending) {
        throw "Pending splits not found!"
    }
  } catch (e) {
      res.render("user/error", {errorMessage: e, title:"Pending Splits Not Found" , class: "error"});
  }

  let requestPending = await requireRequest.checkPending(userId);
  // check if split pending found
  try {
    if (!requestPending) {
        throw "Pending requests not found!"
    }
  } catch (e) {
      res.render("user/error", {errorMessage: e, title:"Pending Requests Not Found" , class: "error"});
  }
  
  res.render("user/pending", {splitPending: splitPending, requestPending: requestPending, pendingActive: "active"});
});

router.delete("/:id", async (req, res) => {
  let userId = req.params.id;
  let userInfo = await requireUsers.getUser(userId);
  let deleteUser = await requireUsers.deleteUser(userInfo.email);

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