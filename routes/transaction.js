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

    let addTransaction;
    try {
      addTransaction = await requireTransactions.addTransaction(userId, transactionDetails);
    } catch (e) {
      return res.render("user/error", {error: e, title:"Transaction Error" , class: "error"})
    }

    // check if add transaction found
    try {
      if (!addTransaction) {
          throw "Added transaction not found!"
      }
    } catch (e) {
        return res.render("user/error", {error: e, title:"Added Transaction Not Found" , class: "error"});
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

    let addTransactionSplit;
    try {
      addTransactionSplit = await requireTransactions.addTransaction(userId, transactionDetailsSplit);
    } catch(e) {
        return res.render("user/addTransaction", {error: e, title:"Added Split Not Found" , class: "error"});
    }

    // check if add split found
    try {
      if (!addTransactionSplit) {
          throw "Added split not found!"
      }
    } catch (e) {
        return res.render("user/error", {error: e, title:"Added Split Not Found" , class: "error"});
    }

    res.render("user/success", {message: "Transaction added!"});
  }

});

router.get('/splitAccept/:id', async (req, res) => {
  let splitTransactionId = req.params.id;
  let userId = req.session.userId;


  let splitTransactionDetails;
  try {
    splitTransactionDetails = await requireSplit.updateSplitCalculation(splitTransactionId, userId);
  } catch (e) {
    return res.render("user/error", {error: e, title:"Updated Split Failed" , class: "error"});
  }

  res.render("user/success", {message: "Updated Successfully"});
});

router.get('/splitDecline/:id', async (req, res) => {
  let splitTransactionId = req.params.id;
  let userId = req.session.userId;

  let splitTransactionDetails
  
  try {
    splitTransactionDetails= await requireSplit.cancelSplit(splitTransactionId, userId);
  } catch (e) {
    return res.render("user/error", {error: e, title:"Cancel Split Error" , class: "error"});
  }
    // check if cancel split found
  try {
    if (!splitTransactionDetails) {
        throw "Cancelled split not found!"
    }
  } catch (e) {
      return res.render("user/error", {error: e, title:"Cancelled Split Not Found" , class: "error"});
  }

  res.render("user/success", {message: "Cancelled successfully"});
});

router.get('/:id', async (req, res) => {
  let transactionId = req.params.id;
  let transactionDetails;
  try {
    transactionDetails = await requireTransactions.getTransaction(transactionId);
  } catch (e) {
    return res.render("user/error", {error: e, title:"Transaction Not Found" , class: "error"});
  }

  // check if transaction deatails found
  try {
    if (!transactionDetails) {
        throw "Transaction not found!"
    }
  } catch (e) {
      return res.render("user/error", {error: e, title:"Transaction Not Found" , class: "error"});
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

    let updateTransaction;
    try {
      updateTransaction = await requireTransactions.updateTransaction(transactionId, transactionDetails);
    } catch (e) {
      return res.render("user/error", {error: e, title:"Transaction Updation Failed" , class: "error"});
    }
    
    // check if transaction updated found
    try {
      if (!updateTransaction) {
          throw "Transaction updation failed!"
      }
    } catch (e) {
        return res.render("user/error", {error: e, title:"Transaction Updation Failed" , class: "error"});
    }

    res.render("user/success", {message: "Transaction updated!"})
  });

router.delete("/:id", async (req, res) => {
  let details = req.body;
  let transactionId = details.transactionId;
  let deleteTransaction;

  try {
    deleteTransaction = await requireTransactions.deleteTransaction(transactionId);
  } catch (e) {
      return res.render("user/error", {error: e, title:"Transaction Deletion Failed" , class: "error"});
  }

  res.render("user/success", {message: "Transaction deleted!"});
});

module.exports = router;