const express = require('express');
const router = express.Router();
const session = require('express-session')
const data = require('../data');
const requireTransactions = data.transactions;

router.get('/', async (req, res) => {
    let userId = req.session.userId;
    let recentTransactions = await requireTransactions.recentTransactions(userId);

    // check if recent transactions not found
    try {
        if (!recentTransactions) {
        throw "Recent transactions not found!";
        }
    } catch (e) {
        res.render("user/recentTransactions", {errorMessage: e, title:"Recent Transactions Not Found" , class: "error", recentActive: "active"});
    }

    res.render("user/recentTransactions", {recentTransactions: recentTransactions, recentActive: "active"});
});

module.exports = router;