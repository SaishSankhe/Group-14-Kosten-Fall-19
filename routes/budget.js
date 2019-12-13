const express = require('express');
const router = express.Router();
const requireUsers = require("../data/users");
const requireBudget = require("../data/budget");
const requireRequest = require("../data/request");

router.get("/", async (req, res) => {
    res.render("user/setBudget");
});

router.get("/my-budget", async (req, res) => {
    let userId = req.session.userId;
    let userInfo = await requireUsers.getUser(userId);
    let budgetId = userInfo.budgetId;
    let budgetInfo = await requireBudget.getBudget(budgetId);
    res.render("user/displayBudget", {budgetInfo: budgetInfo});
});

router.post("/", async (req, res) => {
    let details = req.body;

    let income = details.income

    let grocery = details.grocery;
    let entertainment = details.entertainment;
    let eatingOut = details.eatingOut;
    let bills = details.bills;
    let savings = details.savings;
    let misc = details.misc;
    let transportation = details.transportation;
    let departmentalStore = details.departmentalStore;

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