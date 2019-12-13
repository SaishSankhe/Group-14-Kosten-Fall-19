const mongoCollections = require("../config/mongoCollections");
const split = mongoCollections.split;
const requireUsers = require("./users");
const requireTransactions = require("./transactions");
const ObjectId = require('mongodb').ObjectID;

async function updateSplitCalculation (splitId, userId) {
    const splitCollection = await split();

    let splitInfo = await getSplitTransaction(splitId);
    const transactionId = splitInfo.transactionId;
    let transaction = await requireTransactions.getTransaction(transactionId);

    const transactionTime = transaction.date_time.toString();

    const transactionCategory = transaction.category;
    const splitAmount = splitInfo.splitAmount;
    const superUserId = splitInfo.superUserId;

    let superUserInfo = await requireUsers.getUser(superUserId);
    let userInfo = await requireUsers.getUser(userId);
    
    let superUserCurrentAmount = superUserInfo.currentAmount;
    let userCurrentAmount = userInfo.currentAmount;
    
    let ifEnoughBalance = checkUserBalance (userCurrentAmount, splitAmount);

    if (ifEnoughBalance === true) {
        superUserCurrentAmount = parseFloat(superUserCurrentAmount) + parseFloat(splitAmount);
        userCurrentAmount = parseFloat(userCurrentAmount) - parseFloat(splitAmount);
        
        superUserInfo.currentAmount = superUserCurrentAmount.toString();
        await requireUsers.updateAmount(superUserInfo);

        userInfo.currentAmount = userCurrentAmount.toString();
        await requireUsers.updateAmount(userInfo);

        for (let i in splitInfo.requestFlag) {
            let userIdString = splitInfo.requestFlag[i].userId;
            if(userIdString.toString() === userId) {
                splitInfo.requestFlag[i].flag = true;
            }
        }

        let updateSplitIdInfo = await splitCollection.updateOne({_id: ObjectId(splitId)}, {$set: splitInfo});
        
        if (updateSplitIdInfo.modifiedCount === 0)
            return false;

        await requireTransactions.resetAndSetCategories(transactionTime, userInfo, splitAmount, "debit", transactionCategory);

        await requireTransactions.resetAndSetCategories(transactionTime, superUserInfo, splitAmount, "credit", transactionCategory);
    }
    else
        return false;
}

async function checkSplitPending (userId) {
    const splitCollection = await split();

    let getPending = await splitCollection.find( { $and: [ { "requestFlag.userId": ObjectId(userId) }, { "requestFlag.flag": false } ] } ).toArray();

    console.log(getPending);
    return getPending;
}

function checkUserBalance (currentAmount, splitAmount) {
    if (currentAmount < splitAmount)
        return false;
    else
        return true;
}

async function getSplitTransaction (splitId) {
    let splitCollection = await split();
    let getSplitDetails = await splitCollection.findOne({_id: ObjectId(splitId)});
    if(!getSplitDetails)
        return false;
    else
        return getSplitDetails;
}

module.exports = {
    updateSplitCalculation,
    checkUserBalance,
    getSplitTransaction,
    checkSplitPending
}