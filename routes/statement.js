const express = require('express');
const router = express.Router();
const data = require('../data');
const requireStatement = data.statement;

router.get('/', async (req, res) => {
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let date = new Date().getDate();
    let hours = new Date().getHours();
    let minutes = new Date().getMinutes();
    let seconds = new Date().getSeconds();
    let milliseconds = new Date().getMilliseconds();
    var fullDate = new Date(year, month-1, date, hours, minutes, seconds, milliseconds).toISOString();

    let userId = req.session.userId;

    let creditDebit = await requireStatement.checkCreditDebit(userId, fullDate);
    let sender = await requireStatement.checkSentSender(userId, fullDate);
    let receiver = await requireStatement.checkSentReceiver(userId, fullDate);
    let requester = await requireStatement.checkRequestRequester(userId, fullDate);
    let granter = await requireStatement.checkRequestGranter(userId, fullDate);
    let splitDebit = await requireStatement.checkSplitDebit(userId, fullDate);
    let splitCredit = await requireStatement.checkSplitCredit(userId, fullDate);

    res.render("user/statement", { title: "Statement", creditDebit: creditDebit, sender: sender, receiver: receiver, requester: requester, granter: granter, splitDebit: splitDebit, splitCredit: splitCredit, viewActive: "active" });
});

module.exports = router;