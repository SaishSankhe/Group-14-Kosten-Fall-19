const mongoCollections = require("../config/mongoCollections");
const requested = mongoCollections.request;
const requireUsers = require("./users");
const requireTransactions = require("./transactions");
const ObjectId = require('mongodb').ObjectID;

async function createRequest (requestDetails) {
    const requestCollection = await requested();

    let requesterId = requestDetails.requesterId;
    let granterEmail = requestDetails.granterEmail;
    let amount = requestDetails.amount;
    let date_time = requestDetails.date_time;

    let requesterInfo = await requireUsers.getUser(requesterId);
    let granterInfo = await requireUsers.getUserByEmail(granterEmail);
    let granterId = granterInfo._id;

    let requestDetailsObj = {
        requesterId: ObjectId(requesterId),
        granterId: granterId,
        amount: amount,
        remark: requestDetails.remark,
        date_time: date_time,
        requestFlag: false
    }

    let insertRequestInfo = await requestCollection.insertOne(requestDetailsObj);
    if (insertRequestInfo.insertedCount === 0) 
        return false;
    
    const newRequestId = insertRequestInfo.insertedId;
    requesterInfo.transactionIds.requested.push(newRequestId);
    await requireUsers.updateTransactionIds(requesterInfo);
}

async function acceptRequest (requestId) {
    const requestCollection = await requested();

    let requestInfo = await getRequestInfo(requestId);

    const requestAmount = requestInfo.amount;
    let requesterInfo = await requireUsers.getUser(requestInfo.requesterId);
    let granterInfo = await requireUsers.getUser(requestInfo.granterId);

    let isEnoughBalance = checkGranterBalance(granterInfo.currentAmount, requestAmount)
    if (isEnoughBalance === true) {
        let granterCurrentAmount = parseFloat(granterInfo.currentAmount) - parseFloat(requestAmount);
        granterInfo.currentAmount = granterCurrentAmount.toString()
        await requireUsers.updateAmount(granterInfo);
        granterInfo.transactionIds.requestGranted.push(ObjectId(requestId));
        await requireUsers.updateTransactionIds(granterInfo);

        let requesterCurrentAmount = parseFloat(requesterInfo.currentAmount) + parseFloat(requestAmount);
        requesterInfo.currentAmount = requesterCurrentAmount.toString()
        await requireUsers.updateAmount(requesterInfo);

        requestInfo.requestFlag = true;

        let updateRequestIdInfo = await requestCollection.updateOne({_id: ObjectId(requestId)}, {$set: requestInfo});
            
        if (updateRequestIdInfo.modifiedCount === 0)
            return false;
        else
            return true;
    }
    return false;
}

async function declineRequest (requestId) {
    const requestCollection = await requested();

    let requestInfo = await getRequestInfo(requestId);
    let requesterInfo = await requireUsers.getUser(requestInfo.requesterId);

    for (let i in requesterInfo.transactionIds.requested) {
        if (requesterInfo.transactionIds.requested[i].toString() === requestId.toString()) {
            requesterInfo.transactionIds.requested.splice(requesterInfo.transactionIds.requested[i], 1);
            await requireUsers.updateAmount(requesterInfo);
        }
    }

    let deleteInfo = await requestCollection.removeOne({_id: ObjectId(requestId)});
    
    if (deleteInfo.deletedCount === 0) {
        return false;
    }
    if (deleteInfo.deletedCount === 1) {
        return true;
    }
}

async function checkPending (granterId) {
    const requestCollection = await requested();

    let getPending = await requestCollection.find( { $and: [ { granterId: ObjectId(granterId) }, { requestFlag: false } ] } ).toArray();

    return getPending;
}

function checkGranterBalance (currentAmount, requestAmount) {
    if (currentAmount < requestAmount)
        return false;
    else
        return true;
}

async function getRequestInfo (requestId) {
    const requestCollection = await requested();
    let getRequestDetails = await requestCollection.findOne({_id: ObjectId(requestId)});
    if(!getRequestDetails)
        return false;
    else
        return getRequestDetails;
}

module.exports = {
    createRequest,
    acceptRequest,
    checkPending,
    checkGranterBalance,
    getRequestInfo,
    declineRequest
}