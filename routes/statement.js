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

    let creditDebit;
    let sender;
    let receiver;
    let requester;
    let granter;
    let splitDebit;
    let splitCredit;

    try {
        creditDebit = await requireStatement.checkCreditDebit(userId, fullDate);
        sender = await requireStatement.checkSentSender(userId, fullDate);
        receiver = await requireStatement.checkSentReceiver(userId, fullDate);
        requester = await requireStatement.checkRequestRequester(userId, fullDate);
        granter = await requireStatement.checkRequestGranter(userId, fullDate);
        splitDebit = await requireStatement.checkSplitDebit(userId, fullDate);
        splitCredit = await requireStatement.checkSplitCredit(userId, fullDate);
    } catch (e) {
        return res.render("user/statement", {error: e, title:"Statement Error" , class: "error", viewActive: "active"});
    }

    res.render("user/statement", { title: "Statement", creditDebit: creditDebit, sender: sender, receiver: receiver, requester: requester, granter: granter, splitDebit: splitDebit, splitCredit: splitCredit, viewActive: "active" });
});

module.exports = router;