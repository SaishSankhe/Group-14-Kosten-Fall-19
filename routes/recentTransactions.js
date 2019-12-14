const express = require('express');
const router = express.Router();
const session = require('express-session')
const data = require('../data');
const requireTransactions = data.transactions;

router.get('/', async (req, res) => {
    let userId = req.session.userId;
    let recentTransactions = await requireTransactions.recentTransactions(userId);
    res.render("user/recentTransactions", {recentTransactions: recentTransactions});
});

module.exports = router;