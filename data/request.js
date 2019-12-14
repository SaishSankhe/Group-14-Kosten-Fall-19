const mongoCollections = require("../config/mongoCollections");
const requested = mongoCollections.request;
const requireUsers = require("./users");
const requireTransactions = require("./transactions");
const ObjectId = require('mongodb').ObjectID;

async function createRequest (requestDetails) {
    const requestCollection = await requested();

    let requesterId = requestDetails.requesterId.trim();
    let granterEmail = requestDetails.granterEmail.toLowerCase().trim();
    let amount = requestDetails.amount.trim();
    let date_time = requestDetails.date_time;

    let requesterInfo = await requireUsers.getUser(requesterId);
    let granterInfo = await requireUsers.getUserByEmail(granterEmail);

    // check if requester found
    if (!requesterInfo) {
        throw "Requester not found!"
    }

    // check if granter is a registered user
    if (!granterInfo) {
        throw "You cannot request money from unregistered user!"
    }

    let granterId = granterInfo._id;

    let requestDetailsObj = {
        requesterId: ObjectId(requesterId),
        granterId: granterId,
        amount: amount,
        remark: requestDetails.remark.trim(),
        date_time: date_time,
        requestFlag: false
    }

    let insertRequestInfo = await requestCollection.insertOne(requestDetailsObj);
    if (insertRequestInfo.insertedCount === 0) 
        return false;
    
    const newRequestId = insertRequestInfo.insertedId;
    requesterInfo.transactionIds.requested.push(newRequestId);
    await requireUsers.updateTransactionIds(requesterInfo);

    return true;
}

async function acceptRequest (requestId) {
    const requestCollection = await requested();

    let requestInfo = await getRequestInfo(requestId);

    const requestAmount = requestInfo.amount.trim();
    let requesterInfo = await requireUsers.getUser(requestInfo.requesterId);

    // check if requester found
    if (!requesterInfo) {
        throw "Requester not found!"
    }

    let granterInfo = await requireUsers.getUser(requestInfo.granterId);

    // check if granter found
    if (!requestgranterInfoerInfo) {
        throw "Granter not found!"
    }

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
    else
        throw "You do not have enough money to approve this request!";
}

async function declineRequest (requestId) {
    const requestCollection = await requested();

    let requestInfo = await getRequestInfo(requestId);
    let requesterInfo = await requireUsers.getUser(requestInfo.requesterId);

    // check if requester found
    if (!requesterInfo) {
        throw "Requester not found!"
    }

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