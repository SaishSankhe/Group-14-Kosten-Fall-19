const express = require('express');
const router = express.Router();
const session = require('express-session')
const data = require('../data');
const requireSend = data.send;

router.get('/', async (req, res) => {
    res.render("user/send", {title: "Send", sendActive: "active"});
});

router.post('/', async (req, res) => {
  let details = req.body;
  
  let senderId = req.session.userId;
  let receiverEmail = details.receiverEmail.toLowerCase().trim();
  let amount = details.amount.trim();
  let remark = details.remark.trim();
  let date_time = new Date();

  let sendDetails =  {
        senderId: senderId,
        receiverEmail: receiverEmail,
        amount: amount,
        remark: remark,
        date_time: date_time
  }

  let sendMoney = await requireSend.sendMoney(sendDetails);
  res.render("user/success", {message: "Money sent!"})
});
  
module.exports = router;