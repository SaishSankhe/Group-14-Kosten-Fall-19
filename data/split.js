const mongoCollections = require("../config/mongoCollections");
const split = mongoCollections.split;
const requireUsers = require("./users");
const requireTransactions = require("./transactions");
const ObjectId = require('mongodb').ObjectID;

async function updateSplitCalculation (splitId, userId) {
    const splitCollection = await split();

    let splitInfo = await getSplitTransaction(splitId);
    // check if split info found
    if (!splitInfo) {
        throw "Split info not found!"
    }

    const transactionId = splitInfo.transactionId;
    let transaction = await requireTransactions.getTransaction(transactionId);
    // check if transaction found
    if (!transaction) {
        throw "Transaction not found!"
    }

    const transactionTime = transaction.date_time.toString();

    const transactionCategory = transaction.category.trim();
    const splitAmount = splitInfo.splitAmount;
    const superUserId = splitInfo.superUserId;

    let superUserInfo = await requireUsers.getUser(superUserId);
    // check if superuser found
    if (!superUserInfo) {
        throw "Super user not found!"
    }

    let userInfo = await requireUsers.getUser(userId);
    // check if split user found
    if (!userInfo) {
        throw "Other users not found!"
    }
    
    let superUserCurrentAmount = superUserInfo.currentAmount.trim();
    let userCurrentAmount = userInfo.currentAmount.trim();
    
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
            throw "Updating split id failed!";

        await requireTransactions.resetAndSetCategories(transactionTime, userInfo, splitAmount, "debit", transactionCategory);

        await requireTransactions.resetAndSetCategories(transactionTime, superUserInfo, splitAmount, "credit", transactionCategory);
    }
    else
        throw "Not enough balance!";
}

async function checkSplitPending (userId) {
    const splitCollection = await split();

    let pendingTransactionsArr = new Array();
    let getAllSplitTransactionsOfUser = await splitCollection.find({"requestFlag.userId": ObjectId(userId)}).toArray();
    for (let i in getAllSplitTransactionsOfUser) {
        for (let j in getAllSplitTransactionsOfUser[i].requestFlag) {
            if (getAllSplitTransactionsOfUser[i].requestFlag[j].userId.toString() === ObjectId(userId).toString() && getAllSplitTransactionsOfUser[i].requestFlag[j].flag === false) {
                pendingTransactionsArr.push(getAllSplitTransactionsOfUser[i]);
            }
        }
    }
    
    return pendingTransactionsArr;
}

async function cancelSplit (splitId, userId) {
    const splitCollection = await split();

    let splitTransactionDetails = await getSplitTransaction(splitId);
    let userInfo = await requireUsers.getUser(userId);
    // check if transaction found
    if (!userInfo) {
        throw "User not found!"
    }

    for (i in splitTransactionDetails.requestFlag) {
        if(splitTransactionDetails.requestFlag[i].userId.toString() === userId.toString())
            splitTransactionDetails.requestFlag[i].flag = "cancelled";
    }
    
    for (let i in userInfo.transactionIds.splitDebit) {
        if (userInfo.transactionIds.splitDebit[i].toString() === splitId.toString()) {
            userInfo.transactionIds.splitDebit.splice(userInfo.transactionIds.splitDebit[i], 1);
            await requireUsers.updateAmount(userInfo);
        }
    }
    let updateSplit = await splitCollection.updateOne({_id: ObjectId(splitId)}, {$set: splitTransactionDetails});
    if (updateSplit.modifiedCount === 0) 
        return false;
    else
        return true;
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
    checkSplitPending,
    cancelSplit
}