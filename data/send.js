const mongoCollections = require("../config/mongoCollections");
const sent = mongoCollections.send;
const requireUsers = require("./users");
const requireTransactions = require("./transactions");
const ObjectId = require('mongodb').ObjectID;

async function sendMoney (sendDetails) {
    const sentCollection = await sent();

    let senderId = sendDetails.senderId;
    let receiverEmail = sendDetails.receiverEmail;
    let amount = sendDetails.amount;

    let senderInfo = await requireUsers.getUser(senderId);
    let receiverInfo = await requireUsers.getUserByEmail(receiverEmail);
    let receiverId = receiverInfo._id;
    let senderCurrentAmount = senderInfo.currentAmount;

    let isEnoughBalance = checkUserBalance(senderCurrentAmount, amount);

    if (isEnoughBalance === true) {
        let sendDetailsObj = {
            senderId: ObjectId(sendDetails.senderId),
            receiverId: ObjectId(receiverId),
            amount: sendDetails.amount,
            remark: sendDetails.remark,
            date_time: sendDetails.date_time
        }

        let insertSentInfo = await sentCollection.insertOne(sendDetailsObj);
        if (insertSentInfo.insertedCount === 0) 
            return false;
        
        const newSentId = insertSentInfo.insertedId;

        let senderCurrentAmount = parseFloat(senderInfo.currentAmount) - parseFloat(amount);
        let receiverCurrentAmount = parseFloat(receiverInfo.currentAmount) + parseFloat(amount);

        senderInfo.currentAmount = senderCurrentAmount.toString();
        await requireUsers.updateAmount(senderInfo);
        senderInfo.transactionIds.sent.push(newSentId);
        await requireUsers.updateTransactionIds(senderInfo);

        receiverInfo.currentAmount = receiverCurrentAmount.toString();
        await requireUsers.updateAmount(receiverInfo);
        receiverInfo.transactionIds.received.push(newSentId);
        await requireUsers.updateTransactionIds(receiverInfo);

        return true;
    }

    else
        return false;
}

function checkUserBalance (currentAmount, amount) {
    if (currentAmount < amount)
        return false;
    else
        return true;
}

module.exports = {
    sendMoney
}