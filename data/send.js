const mongoCollections = require("../config/mongoCollections");
const sent = mongoCollections.send;
const requireUsers = require("./users");
const requireTransactions = require("./transactions");
const ObjectId = require('mongodb').ObjectID;

async function sendMoney (sendDetails) {
    const sentCollection = await sent();

    let senderId = sendDetails.senderId;
    let receiverEmail = sendDetails.receiverEmail.toLowerCase().trim();
    let amount = sendDetails.amount.trim();

    let senderInfo = await requireUsers.getUser(senderId);
    // check if sender is found
    if (!senderInfo) {
        throw "Sender not found!"
    }

    let receiverInfo = await requireUsers.getUserByEmail(receiverEmail);

    // check if receiver is registered user
    if (!receiverInfo) {
        throw "Money cannot be sent to an unregistered user!"
    }

    let receiverId = receiverInfo._id;
    let senderCurrentAmountStr = senderInfo.currentAmount.trim();
    let senderCurrentAmount = parseFloat(senderCurrentAmountStr);

    let isEnoughBalance = checkUserBalance(senderCurrentAmount, amount);

    if (isEnoughBalance === true) {
        let sendDetailsObj = {
            senderId: ObjectId(sendDetails.senderId),
            receiverId: ObjectId(receiverId),
            amount: sendDetails.amount.trim(),
            remark: sendDetails.remark.trim(),
            date_time: sendDetails.date_time
        }

        let insertSentInfo = await sentCollection.insertOne(sendDetailsObj);

        // check if inserting send is successful
        if (insertSentInfo.insertedCount === 0) 
            throw "Adding send transaction failed!";
        
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
        throw "You do not have enough balance to send money!";
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