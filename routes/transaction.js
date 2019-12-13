const express = require('express');
const router = express.Router();
const session = require('express-session')
const data = require('../data');
const requireTransactions = data.transactions;

router.get('/', async (req, res) => {
  res.render("user/addTransaction", {title: "Login"});
});

router.post('/', async (req, res) => {
  let details = req.body;

  let userId = req.session.userId;
  let amount = details.amount;
  let type = details.type;
  let date_time = new Date();
  let category = details.category;
  let transactionName = details.transactionName;
  let splitBool = false;

  let transactionDetails = {};
  if (splitBool === false) {
    transactionDetails = {
        userId: userId,
        amount: amount,
        type: type,
        date_time: date_time,
        category: category,
        transactionName: transactionName,
        split: {
            bool: splitBool
        }
    }
  }

  if (splitBool === true) {
    transactionDetails = {
        userId: userId,
        amount: amount,
        type: type,
        date_time: date_time,
        category: category,
        transactionName: transactionName,
        split: {
            bool: splitBool,
            requestFlag: []
        }
    }
  }

  let addTransaction = await requireTransactions.addTransaction(userId, transactionDetails);
  res.render("user/success", {message: "Transaction added!"})
});

module.exports = router;