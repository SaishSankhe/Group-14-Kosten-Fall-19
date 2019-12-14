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
            return "Cannot update at the moment!";

        await requireTransactions.resetAndSetCategories(transactionTime, userInfo, splitAmount, "debit", transactionCategory);

        await requireTransactions.resetAndSetCategories(transactionTime, superUserInfo, splitAmount, "credit", transactionCategory);
        return "Updated successfully!";
    }
    else
        throw "Not enough balance!";
}

async function checkSplitPending (userId) {
    const splitCollection = await split();

    let getPending = await splitCollection.find( { "requestFlag.userId": ObjectId(userId) } ).toArray();
    let getPendingArr = [];
    if (getPending.length > 0) {
        for (i=0; i<getPending.length; i++) {
            for (j=0; j<getPending[i].requestFlag.length; j++) {
                if (getPending[i].requestFlag[j].userId.toString() === ObjectId(userId).toString() && getPending[i].requestFlag[j].flag === true){
            
                }
                getPendingArr.push(getPending.splice(i, 1));
            }
        }
    }
    let finalArr = [];
    for (i=0; i<1; i++){
        for(j=0; j<getPendingArr.length; j++){
            finalArr.push(getPendingArr[j][i]);
        }
    }
    return finalArr;
}

async function cancelSplit (splitId, userId) {
    const splitCollection = await split();

    let splitTransactionDetails = await getSplitTransaction(splitId);
    let userInfo = await requireUsers.getUser(userId);

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

cancelSplit("5df4396b7d427117241473cd", "5df42ea6ed991316cee2f2b6");

module.exports = {
    updateSplitCalculation,
    checkUserBalance,
    getSplitTransaction,
    checkSplitPending,
    cancelSplit
}