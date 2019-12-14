const express = require('express');
const router = express.Router();
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

router.get('/accept/:id', async (req, res) => {
  let requestId = req.params.id;
  
  let acceptRequest = await requireRequest.acceptRequest(requestId);
  if(acceptRequest === true)
    res.render("user/success", {message: "Paid successfully!"});
  if (acceptRequest === false)
    res.render("user/error", {class: "error", message: "Not enough balance!"});
});

router.get('/decline/:id', async (req, res) => {
  let requestId = req.params.id;
  
  let declineRequest = await requireRequest.declineRequest(requestId);
  if(declineRequest === true)
    res.render("user/success", {message: "Declined successfully!"});
  if (declineRequest === false)
    res.render("user/error", {class: "error", message: "Not enough balance!"});
});

module.exports = router;