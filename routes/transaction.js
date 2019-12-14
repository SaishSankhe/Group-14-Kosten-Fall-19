const express = require('express');
const router = express.Router();
const session = require('express-session')
const data = require('../data');
const requireTransactions = data.transactions;
const requireSplit = data.split;

router.get('/', async (req, res) => {
  res.render("user/addTransaction", {title: "Transaction", transActive: "active"});
});

router.post('/', async (req, res) => {
  let details = req.body;
  let userId = req.session.userId;
  let amount = details.amount.trim();
  let type = details.type.trim();
  let date_time = new Date();
  let category = details.category.trim();
  let transactionName = details.transactionName.trim();
  
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
    // check if add transaction found
    try {
      if (!addTransaction) {
          throw "Added transaction not found!"
      }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"Added Transaction Not Found" , class: "error"});
    }

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
    // check if add split found
    try {
      if (!addTransactionSplit) {
          throw "Added split not found!"
      }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"Added Split Not Found" , class: "error"});
    }

    res.render("user/success", {message: "Transaction added!"});
  }

});

router.get('/splitAccept/:id', async (req, res) => {
  let splitTransactionId = req.params.id;
  let userId = req.session.userId;

  let splitTransactionDetails = await requireSplit.updateSplitCalculation(splitTransactionId, userId);
  // check if update split found
  try {
    if (!splitTransactionDetails) {
        throw "Updated split not found!"
    }
  } catch (e) {
      res.render("user/error", {errorMessage: e, title:"Updated Split Not Found" , class: "error"});
  }

  res.render("user/success", {message: splitTransactionDetails});
});

router.get('/splitDecline/:id', async (req, res) => {
  let splitTransactionId = req.params.id;
  let userId = req.session.userId;

  let splitTransactionDetails = await requireSplit.cancelSplit(splitTransactionId, userId);
  // check if cancel split found
  try {
    if (!splitTransactionDetails) {
        throw "Cancelled split not found!"
    }
  } catch (e) {
      res.render("user/error", {errorMessage: e, title:"Cancelled Split Not Found" , class: "error"});
  }

  res.render("user/success", {message: "Ccancelled successfully"});
});

router.get('/:id', async (req, res) => {
  let transactionId = req.params.id;
  let transactionDetails = await requireTransactions.getTransaction(transactionId);
  // check if transaction deatails found
  try {
    if (!transactionDetails) {
        throw "Transaction not found!"
    }
  } catch (e) {
      res.render("user/error", {errorMessage: e, title:"Transaction Not Found" , class: "error"});
  }

  res.render("user/editTransaction", {transaction: transactionDetails, transActive: "active"});
});

router.put("/:id", async (req, res) => {
  let details = req.body;

  let transactionId = details.transactionId;
  let amount = details.amount.trim();
  let type = details.type.trim();
  let category = details.category.trim();
  let date_time = new Date();
  let transactionName = details.transactionName.trim();

  let transactionDetails = {
        amount: amount,
        type: type,
        category: category,
        date_time: date_time,
        transactionName: transactionName
    }

  let updateTransaction = await requireTransactions.updateTransaction(transactionId, transactionDetails);
  // check if transaction updated found
  try {
    if (!updateTransaction) {
        throw "Transaction updation failed!"
    }
  } catch (e) {
      res.render("user/error", {errorMessage: e, title:"Transaction Updation Failed" , class: "error"});
  }

  res.render("user/success", {message: "Transaction updated!"})
});

router.delete("/:id", async (req, res) => {
  let details = req.body;
  let transactionId = details.transactionId;
  let deleteTransaction = await requireTransactions.deleteTransaction(transactionId);

  res.render("user/success", {message: "Transaction deleted!"});
});

module.exports = router;