const express = require('express');
const router = express.Router();
const requireUsers = require("../data/users");
const requireBudget = require("../data/budget");
const requireRequest = require("../data/request");

router.get("/", async (req, res) => {
    res.render("user/setBudget", {budgetActive: "active"});
});

router.get("/my-budget", async (req, res) => {
    let userId = req.session.userId;
    let userInfo = await requireUsers.getUser(userId);

    // check if user found
    try {
        if (!userInfo) {
            throw "User not found!"
        }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"User Not Found" , class: "error"});
    }
    
    let budgetId = userInfo.budgetId;
    let budgetInfo = await requireBudget.getBudget(budgetId);

    // check if budget found
    try {
        if (!userInfo) {
            throw "Budget not found!"
        }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"Budget Not Found" , class: "error"});
    }

    res.render("user/displayBudget", {budgetInfo: budgetInfo, viewBudActive: "active"});
});

router.post("/", async (req, res) => {
    let details = req.body;

    let income = details.income.trim()

    // check if income is greater than 0
    try {
        if (parseFloat(income) <= 0) {
            throw "Income cannot be less than 0!"
        }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"Invalid Income" , class: "error"});
    }

    let grocery = details.grocery.trim();
    let entertainment = details.entertainment.trim();
    let eatingOut = details.eatingOut.trim();
    let bills = details.bills.trim();
    let savings = details.savings.trim();
    let misc = details.misc.trim();
    let transportation = details.transportation.trim();
    let departmentalStore = details.departmentalStore.trim();

    // check if values are negative
    try {
        if (parseFloat(grocery) < 0 || parseFloat(entertainment) < 0 || parseFloat(eatingOut) < 0 || parseFloat(bills) < 0 || parseFloat(savings) < 0 || parseFloat(misc) < 0 || parseFloat(transportation) < 0 || parseFloat(departmentalStore) < 0) {
            throw "Percent cannot be negative!";
        }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"Invalid values" , class: "error"});
    }

    // check if values add to 1
    let totalPercent = parseFloat(grocery) + parseFloat(entertainment) + parseFloat(eatingOut) + parseFloat(bills) + parseFloat(savings) + parseFloat(misc) + parseFloat(transportation) + parseFloat(departmentalStore);
    try {
        if (totalPercent !== 1) {
            throw "Percent total should be 100!";
        }
    } catch (e) {
        res.render("user/error", {errorMessage: e, title:"Incorrect values" , class: "error"});
    }

    let userId = req.session.userId;

    let budgetObj = {
        income: income,
        budgetPercent: {
            grocery: grocery,
            entertainment: entertainment,
            eatingOut: eatingOut,
            bills: bills,
            savings: savings,
            misc: misc,
            transportation: transportation,
            departmentalStore: departmentalStore
        }
    }

    let addBudget = await requireBudget.addBudget(userId, budgetObj);

    res.render("user/success", {message: "Budget added"});
});

module.exports = router;