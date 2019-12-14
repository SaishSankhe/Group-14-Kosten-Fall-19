const express = require('express');
const router = express.Router();
const data = require('../data');
const requireRequest = data.request;
const requireUsers = data.users;

router.get('/', async (req, res) => {
  res.render("user/request", {title: "Request", reqActive: "active"});
});

router.post('/', async (req, res) => {
  let details = req.body;
  
  let requesterId = req.session.userId;
  let granterEmail = details.granterEmail.toLowerCase().trim();
  let amount = details.amount.trim();
  let remark = details.remark.trim();
  let date_time = new Date();

  // check if granter is a registered user
  let granterInfo = await requireUsers.getUserByEmail(granterEmail);
  try {
    if (!granterInfo) {
    throw "You cannot request money from unregistered user!"
    }
  } catch (e) {
    res.render("user/error", {errorMessage: e, title:"Granter Not Registered" , class: "error"});
  }

  let requestDetails =  {
        requesterId: requesterId,
        granterEmail: granterEmail,
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
  // check if accepted requested is found
  try {
    if (!acceptRequest) {
    throw "Accepted Request Not Found!"
    }
  } catch (e) {
    res.render("user/error", {errorMessage: e, title:"Request Not Found" , class: "error"});
  }

  if(acceptRequest === true)
    res.render("user/success", {message: "Paid successfully!"});
  if (acceptRequest === false)
    res.render("user/error", {class: "error", message: "Not enough balance!"});
});

router.get('/decline/:id', async (req, res) => {
  let requestId = req.params.id;
  
  let declineRequest = await requireRequest.declineRequest(requestId);
  // check if declined requested is found
  try {
    if (!declineRequest) {
    throw "Declined Request Not Found!"
    }
  } catch (e) {
    res.render("user/error", {errorMessage: e, title:"Request Not Found" , class: "error"});
  }

  if(declineRequest === true)
    res.render("user/success", {message: "Declined successfully!"});
  if (declineRequest === false)
    res.render("user/error", {class: "error", message: "Not enough balance!"});
});

module.exports = router;