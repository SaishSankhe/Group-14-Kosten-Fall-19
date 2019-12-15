const express = require('express');
const router = express.Router();
const session = require('express-session')
const data = require('../data');
const requireSend = data.send;
const requireUsers = data.users;

router.get('/', async (req, res) => {
    res.render("user/send", {title: "Send", sendActive: "active"});
});

router.post('/', async (req, res) => {
  let details = req.body;
  
  let senderId = req.session.userId;
  let receiverEmail = details.receiverEmail.toLowerCase().trim();
  let receiverInfo;
  try {
    receiverInfo = await requireUsers.getUserByEmail(receiverEmail);
    if (!receiverInfo) {
    throw "You cannot send money to unregistered user!"
    }
  } catch (e) {
    return res.render("user/error", {error: e, title:"Receiver Not Registered" , class: "error"});
  }

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

  let sendMoney;
  try {
    sendMoney = await requireSend.sendMoney(sendDetails);
  } catch (e) {
    return res.render("user/error", {error: e, title:"Money Not Sent" , class: "error"});
  }
  
  res.render("user/success", {message: "Money sent!"})
});
  
module.exports = router;