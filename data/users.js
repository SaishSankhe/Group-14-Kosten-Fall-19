const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const ObjectId = require('mongodb').ObjectID;
const bcrypt = require("bcrypt");
const saltRounds = 16;

async function addUser(userDetails) {
    const usersCollection = await users();
    const hashedPassword = await bcrypt.hash(userDetails.password, saltRounds)
    let userDetailsObj = {
        fName: userDetails.fName,
        lName: userDetails.lName,
        email: userDetails.email,
        password: hashedPassword,
        income: undefined,
        currentAmount: "1000",
        transactionIds: {
            sent: [],
            received: [],
            requested: [],
            requestGranted: [],
            splitCredit: [],
            splitDebit: [],
            credit: [],
            debit: []
        },
        currentBudget: {
            monthYear: undefined,
            categories: {
                grocery: "0",
                entertainment: "0",
                eatingOut: "0",
                bills: "0",
                savings: "0",
                misc: "0",
                transportation: "0",
                departmentalStore: "0" 
            }
        },
        statementCurrent: [],
        budgetId: undefined
    };
    let insertInfo = await usersCollection.insertOne(userDetailsObj);
    let userObj = {
        flag: false
    };
    if (insertInfo.insertedCount === 0)
        return userObj;
    
    let newUserId = insertInfo.insertedId;

    userObj = {
        flag: true,
        userId: newUserId
    }

    return userObj;
}

async function updateUser(email, updatedDetails) {
    const usersCollection = await users();
    let updatedDetailsObj = {
        fName: updatedDetails.fName,
        lName: updatedDetails.lName,
        income: updatedDetails.income
    };

    let updateInfo = await usersCollection.updateOne({email: email}, {$set: updatedDetailsObj});
    if (updateInfo.modifiedCount === 0) 
        return false;
    let updatedUser = await usersCollection.findOne({email: email});

    return updatedUser;
}

async function deleteUser(email) {
    const usersCollection = await users();

    const deleteInfo = await usersCollection.removeOne({email: email});

    if (deleteInfo.deletedCount === 0) {
        return false;
    }
    if (deleteInfo.deletedCount === 1) {
        return true;
    }
};

async function getUser (userId) {
    let usersCollection = await users();
    let getUser = await usersCollection.findOne({_id: ObjectId(userId)});
    if(!getUser)
        return false;
    else
        return getUser;
}

async function getUserByEmail (email) {
    let usersCollection = await users();
    let getUserByEmail = await usersCollection.findOne({email: email});
    if(!getUserByEmail)
        return false;
    else
        return getUserByEmail;
}

async function updateTransactionIds (user) {
    let usersCollection = await users();
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(user._id)}, {$set: user});
    if (updateInfo.modifiedCount === 0) 
        return false;
    else
        return true;
}

async function updateAmount (userInfo) {
    let usersCollection = await users();
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(userInfo._id)}, {$set: userInfo});
    if (updateInfo.modifiedCount === 0) 
        return false;
    else
        return true;
}

async function updateUserCategory (user, category, updatedAmount) {
    let usersCollection = await users();
    let updateCurrentBudget = user;
    updateCurrentBudget.currentBudget.categories[category] = updatedAmount;
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(user._id)}, {$set: updateCurrentBudget});
    if (updateInfo.modifiedCount === 0) 
        return false;
    else
        return true;
}

async function resetBudgetCategories (user, reset) {
    let usersCollection = await users();
    let updateCategory = user;
    updateCategory.currentBudget.categories = reset;
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(user._id)}, {$set: updateCategory});
    if (updateInfo.modifiedCount === 0) 
        return false;
    else
        return true;
}

async function updateBudgetMonthYear (user, monthYear) {
    let usersCollection = await users();
    let updateMonthYear = user;
    updateMonthYear.currentBudget.monthYear = monthYear;
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(user._id)}, {$set: updateMonthYear});
    if (updateInfo.modifiedCount === 0)
        return false;
    else
        return true;
}

async function updateUserSplitCreditInfo (user, splitId) {
    let usersCollection = await users();
    let updateSplitCreditId = user;
    updateSplitCreditId.transactionIds.splitCredit.push(splitId);
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(user._id)}, {$set: updateSplitCreditId});
    if (updateInfo.modifiedCount === 0)
        return false;
    else
        return true;
}

async function updateUserSplitDebitInfo (userId, splitId) {
    let usersCollection = await users();
    let updateSplitDebitId = await getUser(userId);
    updateSplitDebitId.transactionIds.splitDebit.push(splitId);
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(userId)}, {$set: updateSplitDebitId});
    if (updateInfo.modifiedCount === 0)
        return false;
    else
        return true;
}

module.exports = {
    addUser,
    updateUser,
    deleteUser,
    getUser,
    getUserByEmail,
    updateTransactionIds,
    updateAmount,
    updateUserCategory,
    resetBudgetCategories,
    updateBudgetMonthYear,
    updateUserSplitCreditInfo,
    updateUserSplitDebitInfo
}