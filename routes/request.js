const express = require('express');
const router = express.Router();
const session = require('express-session')
const data = require('../data');
const requireRequest = data.request;

router.get('/', async (req, res) => {
    res.render("user/request", {title: "Request"});
  });

router.post('/', async (req, res) => {
  let details = req.body;
  
  let requesterId = req.session.userId;
  let granterId = details.granterEmail;
  let amount = details.amount;
  let remark = details.remark;
  let date_time = new Date();

  let requestDetails =  {
        requesterId: requesterId,
        granterEmail: granterId,
        amount: amount,
        remark: remark,
        date_time: date_time,
        requestFlag: false
  }

  let requestMoney = await requireRequest.createRequest(requestDetails);
  res.render("user/success", {message: "Money requested!"})
});
  
  module.exports = router;