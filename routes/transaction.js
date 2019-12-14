const express = require('express');
const router = express.Router();
const session = require('express-session')
const data = require('../data');
const requireTransactions = data.transactions;
const requireSplit = data.split;

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
  
  delete details.transactionName;
  delete details.amount;
  delete details.type;
  delete details.category;
  delete details.split;
  delete details.input;

  if (Object.entries(details).length === 0 && details.constructor === Object) {
    let transactionDetails = {
      userId: userId,
      amount: amount,
      type: type,
      date_time: date_time,
      category: category,
      transactionName: transactionName,
      split: {
          bool: false
      }
    }

    let addTransaction = await requireTransactions.addTransaction(userId, transactionDetails);
    res.render("user/success", {message: "Transaction added!"});
  }

  if (Object.entries(details).length !== 0 && details.constructor === Object) {
    let requestFlag = new Array();
    for ( let i in Object.values(details)) {
      requestFlag.push(Object.values(details)[i]);
    }
    let transactionDetailsSplit = {
      userId: userId,
      amount: amount,
      type: type,
      date_time: date_time,
      category: category,
      transactionName: transactionName,
      split: {
          bool: true
      },
      requestFlag: requestFlag
    }
    let addTransactionSplit = await requireTransactions.addTransaction(userId, transactionDetailsSplit);
    res.render("user/success", {message: "Transaction added!"});
  }

});

router.get('/splitAccept/:id', async (req, res) => {
  let splitTransactionId = req.params.id;
  let userId = req.session.userId;

  let splitTransactionDetails = await requireSplit.updateSplitCalculation(splitTransactionId, userId);

  res.render("user/success", {message: splitTransactionDetails});
});

router.get('/splitDecline/:id', async (req, res) => {
  let splitTransactionId = req.params.id;
  let userId = req.session.userId;

  let splitTransactionDetails = await requireSplit.cancelSplit(splitTransactionId, userId);

  res.render("user/success", {message: "Ccancelled successfully"});
});

router.get('/:id', async (req, res) => {
  let transactionId = req.params.id;
  let transactionDetails = await requireTransactions.getTransaction(transactionId);

  res.render("user/editTransaction", {transaction: transactionDetails});
});

router.put("/:id", async (req, res) => {
  let details = req.body;

  let transactionId = details.transactionId;
  let amount = details.amount;
  let type = details.type;
  let category = details.category;
  let date_time = new Date();
  let transactionName = details.transactionName;

  let transactionDetails = {
        amount: amount,
        type: type,
        category: category,
        date_time: date_time,
        transactionName: transactionName
    }

  let updateTransaction = await requireTransactions.updateTransaction(transactionId, transactionDetails);
  res.render("user/success", {message: "Transaction updated!"})
});

router.delete("/:id", async (req, res) => {
  let details = req.body;
  let transactionId = details.transactionId;
  let deleteTransaction = await requireTransactions.deleteTransaction(transactionId);

  res.render("user/success", {message: "Transaction deleted!"});
});

module.exports = router;