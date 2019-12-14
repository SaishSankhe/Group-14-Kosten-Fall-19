const express = require('express');
const router = express.Router();
const data = require('../data');
const requireRequest = data.request;

router.get('/', async (req, res) => {
    res.render("user/", {title: "Send"});
});