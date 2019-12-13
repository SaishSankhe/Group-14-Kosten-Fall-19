const mongoCollections = require("../config/mongoCollections");
const transaction = mongoCollections.transactions;
const sent = mongoCollections.sent;
const requested = mongoCollections.requested;
const ObjectId = require('mongodb').ObjectID;

async function checkSentSender (senderId, gte) {
    let sentCollection = await sent();

    let getSentDetails = await sentCollection.find( { $and: [ { senderId: ObjectId(senderId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    console.log(getSentDetails);
    return getSentDetails;
}

async function checkSentReceiver (receiverId, gte) {
    let sentCollection = await sent();

    let getReceivedDetails = await sentCollection.find( { $and: [ { receiverId: ObjectId(receiverId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    console.log(getReceivedDetails);
    return getReceivedDetails;
}

async function checkRequestRequester (requesterId, gte) {
    let requestedCollection = await requested();

    let getRequestedDetails = await requestedCollection.find( { $and: [ { requesterId: ObjectId(requesterId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    console.log(getRequestedDetails);
    return getRequestedDetails;
}

async function checkRequestGranter (granterId, gte) {
    let requestedCollection = await requested();

    let getGrantedDetails = await requestedCollection.find( { $and: [ { granterId: ObjectId(granterId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
    console.log(getGrantedDetails);
    return getGrantedDetails;
}

// async function checkCreditDebits (userId, gte) {
//     let transactionCollections = await transaction();

//     let getCreditDebitDetails = await transactionCollections.find( { $and: [ { userId: ObjectId(userId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
//     console.log(getCreditDebitDetails);
//     return getCreditDebitDetails;
// }

// async function checkSplitDebit (granterId, gte) {
//     let requestedCollection = await requested();

//     let getGrantedDetails = await requestedCollection.find( { $and: [ { granterId: ObjectId(granterId) }, { date_time: { $gte: new Date(gte)} } ] } ).toArray();
    
//     console.log(getGrantedDetails);
//     return getGrantedDetails;
// }

module.exports = {
    checkSentSender,
    checkSentReceiver,
    checkRequestRequester,
    checkRequestGranter
}