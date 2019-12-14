const mongoCollections = require("../config/mongoCollections");
const budget = mongoCollections.budget;
const requireUsers = require("./users");
const ObjectId = require('mongodb').ObjectID;

async function addBudget (userId, budgetDetails) {
    const budgetCollection = await budget();

    let budgetObj = await setBudgetObj(userId, budgetDetails);

    let insertInfo = await budgetCollection.insertOne(budgetObj);
    if (insertInfo.insertedCount === 0) 
        throw "Could not add the budget!";
    
    let budgetId = insertInfo.insertedId;

    let userInfo = await requireUsers.getUser(userId);
    userInfo.budgetId = budgetId;
    await requireUsers.updateAmount(userInfo);

    return budgetId;
}

async function resetBudget (userId) {
    const budgetCollection = await budget();

    let userInfo = await requireUsers.getUser(userId);

    // check if user found
    if (!userInfo) {
        throw "User not found!";
    }

    // check income is greater than 0
    let userIncome = parseFloat(userInfo.income);
    if (userIncome <= 0) {
        throw "Income cannot be less than 0!"
    }

    let budgetObj = {
        budgetPercent: {
            grocery: "0.15",
            entertainment: "0.05",
            eatingOut: "0.05",
            bills: "0.30",
            savings: "0.20",
            misc: "0.05",
            transportation: "0.10",
            departmentalStore: "0.10"
        },
        budgetValues: {
            grocery: (0.15 * userIncome).toString(),
            entertainment: (0.05 * userIncome).toString(),
            eatingOut: (0.05 * userIncome).toString(),
            bills: (0.30 * userIncome).toString(),
            savings: (0.20 * userIncome).toString(),
            misc: (0.05 * userIncome).toString(),
            transportation: (0.10 * userIncome).toString(),
            departmentalStore: (0.10 * userIncome).toString()
        }
    };

    let updateInfo = await budgetCollection.updateOne({_id: ObjectId(user.budgetId)}, {$set: budgetObj});
    if (updateInfo.modifiedCount === 0) 
        return false;
    else
        return true;
}

async function updateBudget (userId, budgetDetails) {
    const budgetCollection = await budget();

    let budgetObj = setBudgetObj(userId, budgetDetails);
    
    let updateInfo = await budgetCollection.updateOne({_id: ObjectId(user.budgetId)}, {$set: budgetObj});
    if (updateInfo.modifiedCount === 0) 
        return false;
    else
        return true;
    
}

async function getBudget (budgetId) {
    let budgetCollection = await budget();

    let budgetInfo = await budgetCollection.findOne({_id: ObjectId(budgetId)});

    // check if budget found
    if (!budgetInfo) {
        throw "Budget not found!";
    }
    else
        return budgetInfo;
}

function setBudgetObj (userId, budgetDetails) {

    // check if values add to 1
    let totalPercent = parseFloat(budgetDetails.budgetPercent.grocery) + parseFloat(budgetDetails.budgetPercent.entertainment) + parseFloat(budgetDetails.budgetPercent.eatingOut) + parseFloat(budgetDetails.budgetPercent.bills) + parseFloat(budgetDetails.budgetPercent.savings) + parseFloat(budgetDetails.budgetPercent.misc) + parseFloat(budgetDetails.budgetPercent.transportation) + parseFloat(budgetDetails.budgetPercent.departmentalStore);
    if (totalPercent !== 1) {
        throw "Percent total should be 100!"
    }

    // check if values are negative
    if (parseFloat(budgetDetails.budgetPercent.grocery) < 0 || parseFloat(budgetDetails.budgetPercent.entertainment) < 0 || parseFloat(budgetDetails.budgetPercent.eatingOut) < 0 || parseFloat(budgetDetails.budgetPercent.bills) < 0 || parseFloat(budgetDetails.budgetPercent.savings) < 0 || parseFloat(budgetDetails.budgetPercent.misc) < 0 || parseFloat(budgetDetails.budgetPercent.transportation) < 0 || parseFloat(budgetDetails.budgetPercent.departmentalStore) < 0) {
        throw "Percent cannot be negative!";
    }

    // check income is greater than 0
    if (parseFloat(budgetDetails.income) <= 0) {
        throw "Income cannot be less than 0!"
    }

    let grocery = parseFloat(budgetDetails.budgetPercent.grocery) * parseFloat(budgetDetails.income);
    let entertainment = parseFloat(budgetDetails.budgetPercent.entertainment) * parseFloat(budgetDetails.income);
    let eatingOut = parseFloat(budgetDetails.budgetPercent.eatingOut) * parseFloat(budgetDetails.income);
    let bills = parseFloat(budgetDetails.budgetPercent.bills) * parseFloat(budgetDetails.income);
    let savings = parseFloat(budgetDetails.budgetPercent.savings) * parseFloat(budgetDetails.income);
    let misc = parseFloat(budgetDetails.budgetPercent.misc) * parseFloat(budgetDetails.income);
    let transportation = parseFloat(budgetDetails.budgetPercent.transportation) * parseFloat(budgetDetails.income);
    let departmentalStore = parseFloat(budgetDetails.budgetPercent.departmentalStore) * parseFloat(budgetDetails.income);
    
    let budgetObj = {
        userId: ObjectId(userId),
        income: budgetDetails.income,
        budgetPercent: {
            grocery: budgetDetails.budgetPercent.grocery.trim(),
            entertainment: budgetDetails.budgetPercent.entertainment.trim(),
            eatingOut: budgetDetails.budgetPercent.eatingOut.trim(),
            bills: budgetDetails.budgetPercent.bills.trim(),
            savings: budgetDetails.budgetPercent.savings.trim(),
            misc: budgetDetails.budgetPercent.misc.trim(),
            transportation: budgetDetails.budgetPercent.transportation.trim(),
            departmentalStore: budgetDetails.budgetPercent.departmentalStore.trim()
        },
        budgetValues: {
            grocery: grocery.toString(),
            entertainment: entertainment.toString(),
            eatingOut: eatingOut.toString(),
            bills: bills.toString(),
            savings: savings.toString(),
            misc: misc.toString(),
            transportation: transportation.toString(),
            departmentalStore: departmentalStore.toString()
        }
    };

    return budgetObj;
}

module.exports = {
    addBudget,
    resetBudget,
    getBudget,
    updateBudget
};