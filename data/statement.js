const mongoCollections = require("../config/mongoCollections");
const transaction = mongoCollections.transactions;
const sent = mongoCollections.send;
const requested = mongoCollections.request;
const split = mongoCollections.split;
const ObjectId = require('mongodb').ObjectID;

async function checkSentSender (senderId, gte) {
    let sentCollection = await sent();

    let getSentDetails = await sentCollection.find( { $and: [ { senderId: ObjectId(senderId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    return getSentDetails;
}

async function checkSentReceiver (receiverId, gte) {
    let sentCollection = await sent();

    let getReceivedDetails = await sentCollection.find( { $and: [ { receiverId: ObjectId(receiverId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    return getReceivedDetails;
}

async function checkRequestRequester (requesterId, gte) {
    let requestedCollection = await requested();

    let getRequestedDetails = await requestedCollection.find( { $and: [ { requesterId: ObjectId(requesterId) }, { date_time: { $gte: new Date(gte)} }, { requestFlag: true } ] } ).toArray();
    
    return getRequestedDetails;
}

async function checkRequestGranter (granterId, gte) {
    let requestedCollection = await requested();

    let getGrantedDetails = await requestedCollection.find( { $and: [ { granterId: ObjectId(granterId) }, { date_time: { $gte: new Date(gte)} }, { requestFlag: true } ] } ).toArray();
    
    return getGrantedDetails;
}

async function checkCreditDebit (userId, gte) {
    let transactionCollections = await transaction();

    let getCreditDebitDetails = await transactionCollections.find( { $and: [ { userId: ObjectId(userId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    return getCreditDebitDetails;
}

async function checkSplitDebit (userId, gte) {
    let splitCollection = await split();

    let getSplitDebit = await splitCollection.find( { $and: [ { "requestFlag.userId": ObjectId(userId) }, { date_time: { $gte: new Date(gte)} }, { "requestFlag.flag": true } ] } ).toArray();
    
    return getSplitDebit;
}

async function checkSplitCredit (userId, gte) {
    let splitCollection = await split();

    let getSplitCredit = await splitCollection.find( { $and: [ { superUserId: ObjectId(userId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    return getSplitCredit;
}

//checkSplitDebit("5df42ea6ed991316cee2f2b6", "2019-12-14T01:30:42.634+00:00");

module.exports = {
    checkSentSender,
    checkSentReceiver,
    checkRequestRequester,
    checkRequestGranter,
    checkCreditDebit,
    checkSplitDebit,
    checkSplitCredit
}