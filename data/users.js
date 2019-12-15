const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const ObjectId = require('mongodb').ObjectID;
const bcrypt = require("bcrypt");
const saltRounds = 16;

async function addUser(userDetails) {
    const usersCollection = await users();
    const hashedPassword = await bcrypt.hash(userDetails.password, saltRounds);

    let userDetailsObj = {
        fName: userDetails.fName,
        lName: userDetails.lName,
        email: userDetails.email,
        password: hashedPassword,
        income: undefined,
        currentAmount: "0",
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

    // check if adding user is successful
    if (insertInfo.insertedCount === 0)
        throw "Adding user failed!";
    
    let newUserId = insertInfo.insertedId;

    userObj = {
        flag: true,
        userId: newUserId
    }

    return userObj;
}

async function updateUser(email, updatedDetails) {
    const usersCollection = await users();

    // check if all details are type = string
    if (typeof(updatedDetails.fName) !== 'string' || typeof(updatedDetails.lName) !== 'string' || typeof(updatedDetails.email) !== 'string') {
        throw "All the details must be of type string!";
    }

    let updatedDetailsObj = {
        fName: updatedDetails.fName,
        lName: updatedDetails.lName,
        income: updatedDetails.income
    };

    let updateInfo = await usersCollection.updateOne({email: email}, {$set: updatedDetailsObj});

    // check if updating user is successful
    if (updateInfo.modifiedCount === 0) 
        throw "Updating user failed!";
    let updatedUser = await usersCollection.findOne({email: email});

    return updatedUser;
}

async function deleteUser(email) {
    const usersCollection = await users();

    const deleteInfo = await usersCollection.removeOne({email: email});

    // check if deleting user is successful
    if (deleteInfo.deletedCount === 0) {
        throw "Deleting user failed!";
    }
    if (deleteInfo.deletedCount === 1) {
        return true;
    }
};

async function getUser (userId) {
    let usersCollection = await users();
    let getUser = await usersCollection.findOne({_id: ObjectId(userId)});

    // check if user found
    if(!getUser)
        return false;
    else
        return getUser;
}

async function getUserByEmail (email) {
    let usersCollection = await users();
    let getUserByEmail = await usersCollection.findOne({email: email});

    // check if user found
    if(!getUserByEmail)
        return false;
    else
        return getUserByEmail;
}

async function updateTransactionIds (user) {
    let usersCollection = await users();
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(user._id)}, {$set: user});

    // check if updating transaction IDs is successful
    if (updateInfo.modifiedCount === 0) 
        throw "Updating transaction IDs failed!";
    else
        return true;
}

async function updateAmount (userInfo) {
    let usersCollection = await users();
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(userInfo._id)}, {$set: userInfo});

    // check if updating amount is successful
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

    // check if updating budget category is successful
    if (updateInfo.modifiedCount === 0) 
        throw "Updating budget category failed!";
    else
        return true;
}

async function resetBudgetCategories (user, reset) {
    let usersCollection = await users();
    let updateCategory = user;
    updateCategory.currentBudget.categories = reset;
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(user._id)}, {$set: updateCategory});

    // check if updating budget is successful
    if (updateInfo.modifiedCount === 0) 
        return false
    else
        return true;
}

async function updateBudgetMonthYear (user, monthYear) {
    let usersCollection = await users();
    let updateMonthYear = user;
    updateMonthYear.currentBudget.monthYear = monthYear;
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(user._id)}, {$set: updateMonthYear});

    // check if updating budget monthyear is successful
    if (updateInfo.modifiedCount === 0)
        throw "Updating budget month and year failed!";
    else
        return true;
}

async function updateUserSplitCreditInfo (user, splitId) {
    let usersCollection = await users();
    let updateSplitCreditId = user;
    updateSplitCreditId.transactionIds.splitCredit.push(splitId);
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(user._id)}, {$set: updateSplitCreditId});

    // check if updating split debit info is successful
    if (updateInfo.modifiedCount === 0)
        throw "Updating split debit information failed!";
    else
        return true;
}

async function updateUserSplitDebitInfo (userId, splitId) {
    let usersCollection = await users();
    let updateSplitDebitId = await getUser(userId);

    // check if user found
    if(!updateSplitDebitId)
        throw "This is not a registered user!";

    updateSplitDebitId.transactionIds.splitDebit.push(splitId);
    let updateInfo = await usersCollection.updateOne({_id: ObjectId(userId)}, {$set: updateSplitDebitId});

    // check if updating split credit info is successful
    if (updateInfo.modifiedCount === 0)
        throw "Updating split credit information failed!";
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