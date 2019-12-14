const mongoCollections = require("../config/mongoCollections");
const transaction = mongoCollections.transactions;
const sent = mongoCollections.send;
const requested = mongoCollections.request;
const split = mongoCollections.split;
const requireUsers = require("./users");
const requireTransactions = require("./transactions");
const ObjectId = require('mongodb').ObjectID;

async function checkSentSender (senderId, gte) {
    let sentCollection = await sent();
    
    let getSentDetails = await sentCollection.find( { $and: [ { senderId: ObjectId(senderId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    for (i in getSentDetails) {
        let receiver = await requireUsers.getUser(getSentDetails[i].receiverId);
        getSentDetails[i].receiverName = `${receiver.fName} ${receiver.lName}`;
    }
    return getSentDetails;
}

async function checkSentReceiver (receiverId, gte) {
    let sentCollection = await sent();

    let getReceivedDetails = await sentCollection.find( { $and: [ { receiverId: ObjectId(receiverId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    for (i in getReceivedDetails) {
        let sender = await requireUsers.getUser(getReceivedDetails[i].senderId);
        getReceivedDetails[i].senderName = `${sender.fName} ${sender.lName}`;
    }

    return getReceivedDetails;
}

async function checkRequestRequester (requesterId, gte) {
    let requestedCollection = await requested();

    let getRequestedDetails = await requestedCollection.find( { $and: [ { requesterId: ObjectId(requesterId) }, { date_time: { $gte: new Date(gte)} }, { requestFlag: true } ] } ).toArray();
    for (i in getRequestedDetails) {
        let granter = await requireUsers.getUser(getRequestedDetails[i].granterId);
        getRequestedDetails[i].granterName = `${granter.fName} ${granter.lName}`;
    }

    return getRequestedDetails;
}

async function checkRequestGranter (granterId, gte) {
    let requestedCollection = await requested();

    let getGrantedDetails = await requestedCollection.find( { $and: [ { granterId: ObjectId(granterId) }, { date_time: { $gte: new Date(gte)} }, { requestFlag: true } ] } ).toArray();
    for (i in getGrantedDetails) {
        let requester = await requireUsers.getUser(getGrantedDetails[i].requesterId);
        getGrantedDetails[i].requesterName = `${requester.fName} ${requester.lName}`;
    }

    return getGrantedDetails;
}

async function checkCreditDebit (userId, gte) {
    let transactionCollections = await transaction();

    let getCreditDebitDetails = await transactionCollections.find( { $and: [ { userId: ObjectId(userId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    return getCreditDebitDetails;
}

async function checkSplitDebit (userId, gte) {
    let splitCollection = await split();

    let getSplitDebit = await splitCollection.find( { $and: [ { "requestFlag.userId": ObjectId(userId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    let getPaidByMeSplits = new Array();

    for (let i in getSplitDebit) {
        for (let j in getSplitDebit[i].requestFlag) {
            if (getSplitDebit[i].requestFlag[j].userId.toString() === ObjectId(userId).toString() && getSplitDebit[i].requestFlag[j].flag === true) {
                getPaidByMeSplits.push(getSplitDebit[i]);
            }
        }
    }
    
    for (i in getPaidByMeSplits) {
        let transactionDetails = await requireTransactions.getTransaction(getPaidByMeSplits[i].transactionId);
        getPaidByMeSplits[i].transactionName = transactionDetails.transactionName;
        getPaidByMeSplits[i].category = transactionDetails.category;
    }
    
    return getPaidByMeSplits;
}

async function checkSplitCredit (userId, gte) {
    let splitCollection = await split();

    let getSplitCredit = await splitCollection.find( { $and: [ { superUserId: ObjectId(userId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    let getPaidByOthersSplits = new Array();

    for (let i in getSplitCredit) {
        for (let j in getSplitCredit[i].requestFlag) {
            if (getSplitCredit[i].requestFlag[j].flag === true) {
                getPaidByOthersSplits.push(getSplitCredit[i]);
            }
        }
    }

    for (let i in getPaidByOthersSplits) {
        let numberOfPaidSplits = 0;
        for (let j in getPaidByOthersSplits[i].requestFlag) {
            if (getPaidByOthersSplits[i].requestFlag[j].flag === true) {
                numberOfPaidSplits++;
            }
        }
        getPaidByOthersSplits[i].creditedAmount = parseFloat(getPaidByOthersSplits[i].splitAmount) * numberOfPaidSplits;
    }

    for (i in getPaidByOthersSplits) {
        let transactionDetails = await requireTransactions.getTransaction(getPaidByOthersSplits[i].transactionId);
        getPaidByOthersSplits[i].transactionName = transactionDetails.transactionName;
        getPaidByOthersSplits[i].category = transactionDetails.category;
    }

    return getPaidByOthersSplits;
}

module.exports = {
    checkSentSender,
    checkSentReceiver,
    checkRequestRequester,
    checkRequestGranter,
    checkCreditDebit,
    checkSplitDebit,
    checkSplitCredit
}