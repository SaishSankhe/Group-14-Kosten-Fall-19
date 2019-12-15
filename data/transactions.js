const mongoCollections = require("../config/mongoCollections");
const transaction = mongoCollections.transactions;
const split = mongoCollections.split;
const requireUsers = require("./users");
const ObjectId = require('mongodb').ObjectID;

async function addTransaction (userId, transactionDet) {
    const transactionCollection = await transaction();

    let amountStr = transactionDet.amount.trim();
    let amount = parseFloat(amountStr);
    let type = transactionDet.type;
    const getUser = await requireUsers.getUser(userId);

    // check if user found
    if(!getUser)
        throw "User not found!";

    let userBalance = getUser.currentAmount.trim();
    let isEnoughBalance = checkUserBalanceWhenDebit(userBalance, amount, type);
    let addedTransaction;

    if (isEnoughBalance === true) {
        let transactionDetailsObj = {
            userId: ObjectId(userId),
            amount: transactionDet.amount,
            type: transactionDet.type.trim(),
            date_time: transactionDet.date_time,
            category: transactionDet.category.trim(),
            transactionName: transactionDet.transactionName.trim(),
            split: {
                splitId: undefined,
                bool: transactionDet.split.bool
            }
        };

        let insertTransactionInfo = await transactionCollection.insertOne(transactionDetailsObj);

        // check if inserting transaction is successful
        if (insertTransactionInfo.insertedCount === 0) 
            throw "Adding transaction failed!";

        const newTransactionId = insertTransactionInfo.insertedId;
        addedTransaction = await transactionCollection.findOne({_id: newTransactionId});

        let date_time = transactionDet.date_time;
        let category = transactionDet.category.trim();

        if(type === "debit") {
            if (transactionDet.split.bool === true) {
                const splitCollection = await split();
                let noOfUsers = transactionDet.requestFlag.length + 1;
                let splitAmountFlt = parseFloat(amount)/noOfUsers;
                let splitAmount = splitAmountFlt.toString();
                let splitDetailsObj = {
                    transactionId: newTransactionId,
                    superUserId: ObjectId(userId),
                    splitAmount: splitAmount,
                    date_time: date_time,
                    bool: true,
                    requestFlag:[]
                }

                let findUserIdArr = [];

                for (let i in transactionDet.requestFlag) {
                    let userEmailId = transactionDet.requestFlag[i].toLowerCase();
                    let findUser = await requireUsers.getUserByEmail(userEmailId);
                    let findUserId = findUser._id;
                    findUserIdArr.push(findUserId);
                }

                for (let i in findUserIdArr) {
                    let userObj = {
                        userId: findUserIdArr[i], 
                        flag: false
                    }
                    splitDetailsObj.requestFlag.push(userObj);
                }

                let insertSplitInfo = await splitCollection.insertOne(splitDetailsObj);

                // check if split info is inserted successfully
                if (insertSplitInfo.insertedCount === 0) 
                    throw "Adding split information failed!";

                let newSplitId = insertSplitInfo.insertedId;
                let getTransactionForSplit = await getTransaction(newTransactionId);

                // check is transaction is found
                if(!getTransactionForSplit) {
                    throw "Transaction not found!"
                }

                getTransactionForSplit.split.splitId = newSplitId;
                let updateSplitIdInfo = await transactionCollection.updateOne({_id: ObjectId(newTransactionId)}, {$set: getTransactionForSplit});
                
                // check if split info is updated successfully
                if (updateSplitIdInfo.modifiedCount === 0)
                    throw "Updating split information failed!";

                await requireUsers.updateUserSplitCreditInfo(getUser, newSplitId);
                
                for (let i in findUserIdArr) {
                    await requireUsers.updateUserSplitDebitInfo(findUserIdArr[i], newSplitId);
                }
            }

            let intUpdatedAmount = parseFloat(getUser.currentAmount) - parseFloat(amount);
            let updatedAmount = intUpdatedAmount.toString();
            getUser.currentAmount = updatedAmount;
            await requireUsers.updateAmount(getUser);
            getUser.transactionIds.debit.push(newTransactionId);
            let toBeComparedDebit = date_time.toString();
            
            await resetAndSetStatement(toBeComparedDebit, getUser, newTransactionId);
            await resetAndSetCategories(toBeComparedDebit, getUser, amount, type, category);
        }

        if(type === "credit") {
        
            let intUpdatedAmount = parseFloat(getUser.currentAmount) + parseFloat(amount);
            let updatedAmount = intUpdatedAmount.toString();
            getUser.currentAmount = updatedAmount;
            await requireUsers.updateAmount(getUser);
            getUser.transactionIds.credit.push(newTransactionId);
            let toBeComparedCredit = date_time.toString();
    
            await resetAndSetStatement(toBeComparedCredit, getUser, newTransactionId);
            await resetAndSetCategories(toBeComparedCredit, getUser, amount, type, category)
        }
        
    }
    else {
        throw "You do not have enough money to add this transaction!";
    }

    return addedTransaction;
}

function checkUserBalanceWhenDebit (currentAmount, transactionAmount, transactionType) {
    if (transactionType === "debit") {
        if (currentAmount < transactionAmount)
            return false;
        else
            return true;
    }

    if (transactionType === "credit")
        return true;
}

async function getTransaction (transactionId) {
    let transactionCollection = await transaction();

    let getTransactionDetails = await transactionCollection.findOne({_id: ObjectId(transactionId)});

    // check if transaction found
    if(!getTransactionDetails)
        return false;
    else
        return getTransactionDetails;
}

async function resetAndSetCategories (toBeCompared, getUser, amount, type, category) {
    let isDateEqualBudget = checkDateCurrentBudget(toBeCompared, getUser);

    if (isDateEqualBudget === true) {
        let newCategoryAmount;
        if (type === "debit") {
            newCategoryAmount = parseFloat(getUser.currentBudget.categories[category]) + parseFloat(amount);
        }
        if (type === "credit") {
            newCategoryAmount = parseFloat(getUser.currentBudget.categories[category]) - parseFloat(amount);
        }
        let stringAmount = newCategoryAmount.toString();
        await requireUsers.updateUserCategory(getUser, category, stringAmount);
    }

    else {
        let transactionMonthYear = toBeCompared.split(" ");
        transactionMonthYear = transactionMonthYear[1] + transactionMonthYear[3];

        let resetCategories = {
            grocery: "0",
            entertainment: "0",
            eatingOut: "0",
            bills: "0",
            savings: "0",
            misc: "0",
            transportation: "0",
            departmentalStore: "0"
        }

        await requireUsers.resetBudgetCategories(getUser, resetCategories);
        await requireUsers.updateBudgetMonthYear(getUser, transactionMonthYear);
        
        let intUpdatedAmount;
        if (type === "debit")
            intUpdatedAmount = parseFloat(getUser.currentBudget.categories[category]) + parseFloat(amount);
        if (type === "credit")
            intUpdatedAmount = parseFloat(getUser.currentBudget.categories[category]) - parseFloat(amount);
       
        let updatedAmount = intUpdatedAmount.toString();
        await requireUsers.updateUserCategory(getUser, category, updatedAmount);
    }
}

async function resetAndSetStatement (toBeCompared, getUser, newTransactionId) {
    let isDateEqualStatement = await checkDateStatementCurrent(toBeCompared, getUser);
    
    if (isDateEqualStatement === true) {
        getUser.statementCurrent.push(newTransactionId);
        updateTransaction = await requireUsers.updateTransactionIds(getUser);
    }

    else {
        getUser.statementCurrent = [];
        getUser.statementCurrent.push(newTransactionId);
        updateTransaction = await requireUsers.updateTransactionIds(getUser);
    }
}

async function checkDateStatementCurrent (toBeCompared, user) {
    let statementCurrentArray = user.statementCurrent;
    let statementCurrentArrayLen = statementCurrentArray.length;

    if (statementCurrentArrayLen === 0)
        return true;

    else {
        let toBeComparedWithId = statementCurrentArray[statementCurrentArrayLen - 1];

        let getTransactionDetails = await getTransaction(toBeComparedWithId);
        
        toBeComparedWith = getTransactionDetails.date_time;
        toBeComparedWithString = toBeComparedWith.toString();
        
        let split = toBeComparedWithString.split(" ");
        toBeComparedWithString = split[1] + split[3];
        
        let newSplit = toBeCompared.split(" ");
        toBeCompared = newSplit[1] + newSplit[3];

        if(toBeCompared === toBeComparedWithString)
            return true;
        else
            return false;
    }
}

function checkDateCurrentBudget (toBeCompared, user) {
    let toBeComparedWith = user.currentBudget.monthYear;
    
    let split = toBeCompared.split(" ");
    toBeCompared = split[1] + split[3];
    
    if(toBeCompared === toBeComparedWith)
        return true;
    else
       return false;
}

async function recentTransactions (userId) {
    const transactionCollection = await transaction();

    let getTransactions = await transactionCollection.find({ userId: ObjectId(userId) }).toArray();

    return getTransactions;
}

async function deleteTransaction (transactionId) {
    const transactionCollection = await transaction();

    let getTransactionDetails = await getTransaction(transactionId);
    let userInfo = await requireUsers.getUser(getTransactionDetails.userId);
    let date_time = getTransactionDetails.date_time.toString();

    let isDateEqualBudget = checkDateCurrentBudget(date_time, userInfo);

    let typeOfTransaction = getTransactionDetails.type.trim();
    let amount = getTransactionDetails.amount;
    let currentAmount = userInfo.currentAmount;
    let category = getTransactionDetails.category;

    if (typeOfTransaction === "debit") {
    
        let newCurrentAmount = parseFloat(currentAmount) + parseFloat(amount);
        userInfo.currentAmount = newCurrentAmount.toString();
        await requireUsers.updateAmount(userInfo);

        for (let i in userInfo.transactionIds.debit) {
            if (userInfo.transactionIds.debit[i].toString() === transactionId.toString()) {
                userInfo.transactionIds.debit.splice(userInfo.transactionIds.debit[i], 1);
                await requireUsers.updateAmount(userInfo);
                }
        }
       
        if (isDateEqualBudget === true) {
            
            let categoriesArr = Object.keys(userInfo.currentBudget.categories)
            for (let i in categoriesArr) {
                if (categoriesArr[i] === category) {
                    let newBudgetAmount = parseFloat(userInfo.currentBudget.categories[category]) - parseFloat(amount);
                    userInfo.currentBudget.categories[category] = newBudgetAmount.toString();
                    await requireUsers.updateAmount(userInfo);
                }
            }
            
            for (let i in userInfo.statementCurrent) {
                if (userInfo.statementCurrent[i].toString() === transactionId.toString()) {
                    userInfo.statementCurrent.splice(userInfo.statementCurrent[i], 1);
                    await requireUsers.updateAmount(userInfo);
                }
            }
        }

        let deleteInfo = await transactionCollection.removeOne({_id: ObjectId(transactionId)});

        // check if deleting transaction is successful
        if (deleteInfo.deletedCount === 0) {
            throw "Deleting transaction failed!";
        }
        if (deleteInfo.deletedCount === 1) {
            return true;
        }
    }
    if (typeOfTransaction === "credit") {
        
        let newCurrentAmount = parseFloat(currentAmount) - parseFloat(amount);
        userInfo.currentAmount = newCurrentAmount.toString();
        await requireUsers.updateAmount(userInfo);
        
        for (let i in userInfo.transactionIds.debit) {
            if (userInfo.transactionIds.debit[i].toString() === transactionId.toString()) {
                userInfo.transactionIds.debit.splice(userInfo.transactionIds.debit[i], 1);
                await requireUsers.updateAmount(userInfo);
                }
        }
        
        if (isDateEqualBudget === true) {
            let categoriesArr = Object.keys(userInfo.currentBudget.categories)
            for (let i in categoriesArr) {
                if (categoriesArr[i] === category) {
                    let newBudgetAmount = parseFloat(userInfo.currentBudget.categories[category]) + parseFloat(amount);
                    userInfo.currentBudget.categories[category] = newBudgetAmount.toString();
                    await requireUsers.updateAmount(userInfo);
                }
            }
            
            for (let i in userInfo.statementCurrent) {
                if (userInfo.statementCurrent[i].toString() === transactionId.toString()) {
                    userInfo.statementCurrent.splice(userInfo.statementCurrent[i], 1);
                    await requireUsers.updateAmount(userInfo);
                }
            }
        }
        let deleteInfo = await transactionCollection.removeOne({_id: ObjectId(transactionId)});
        
        // check if deleting transaction is successful
        if (deleteInfo.deletedCount === 0) {
            throw "Deleting transaction failed!";
        }
        if (deleteInfo.deletedCount === 1) {
            return true;
        }
    }
}

async function updateTransaction (transactionId, newTransactionDet) {
    const transactionCollection = await transaction();

    let getTransactionDetails = await getTransaction(transactionId);
    let userInfo = await requireUsers.getUser(getTransactionDetails.userId);
    let date_time = getTransactionDetails.date_time.toString();

    let isDateEqualBudget = checkDateCurrentBudget(date_time, userInfo);

    let typeOfTransaction = getTransactionDetails.type.trim();
    let amount = getTransactionDetails.amount.trim();
    let currentAmount = userInfo.currentAmount.trim();
    let category = getTransactionDetails.category.trim();

    if (typeOfTransaction === "debit") {
    
        let newCurrentAmount = parseFloat(currentAmount) + parseFloat(amount);
        userInfo.currentAmount = newCurrentAmount.toString();
        await requireUsers.updateAmount(userInfo);

        for (let i in userInfo.transactionIds.debit) {
            if (userInfo.transactionIds.debit[i].toString() === transactionId.toString()) {
                userInfo.transactionIds.debit.splice(userInfo.transactionIds.debit[i], 1);
                await requireUsers.updateAmount(userInfo);
                }
        }
       
        if (isDateEqualBudget === true) {
            
            let categoriesArr = Object.keys(userInfo.currentBudget.categories)
            for (let i in categoriesArr) {
                if (categoriesArr[i] === category) {
                    let newBudgetAmount = parseFloat(userInfo.currentBudget.categories[category]) - parseFloat(amount);
                    userInfo.currentBudget.categories[category] = newBudgetAmount.toString();
                    await requireUsers.updateAmount(userInfo);
                }
            }
        }
    }

    if (typeOfTransaction === "credit") {
        let newCurrentAmount = parseFloat(currentAmount) - parseFloat(amount);
        userInfo.currentAmount = newCurrentAmount.toString();
        await requireUsers.updateAmount(userInfo);
        
        for (let i in userInfo.transactionIds.debit) {
            if (userInfo.transactionIds.debit[i].toString() === transactionId.toString()) {
                userInfo.transactionIds.debit.splice(userInfo.transactionIds.debit[i], 1);
                await requireUsers.updateAmount(userInfo);
                }
        }
        
        if (isDateEqualBudget === true) {
            let categoriesArr = Object.keys(userInfo.currentBudget.categories)
            for (let i in categoriesArr) {
                if (categoriesArr[i] === category) {
                    let newBudgetAmount = parseFloat(userInfo.currentBudget.categories[category]) + parseFloat(amount);
                    userInfo.currentBudget.categories[category] = newBudgetAmount.toString();
                    await requireUsers.updateAmount(userInfo);
                }
            }
        }
    }

    let newAmountStr = newTransactionDet.amount.trim()
    let newAmount = parseFloat(newAmountStr);
    let type = newTransactionDet.type.trim();
    let userBalance = userInfo.currentAmount.trim();

    let isEnoughBalance = checkUserBalanceWhenDebit(userBalance, newAmount, type);

    if (isEnoughBalance === true) {
        let updatedDateTime = newTransactionDet.date_time;
        let updatedCategory = newTransactionDet.category.trim();
        
        let updatedtransactionDetailsObj = {
            userId: userInfo._id,
            amount: newAmount,
            type: type,
            date_time: updatedDateTime,
            category: updatedCategory,
            transactionName: newTransactionDet.transactionName
        };
    
        let updateTransactionInfo = await transactionCollection.updateOne({_id: ObjectId(transactionId)}, {$set: updatedtransactionDetailsObj});
        
        // check if updating transction is sucesful
        if (updateTransactionInfo.modifiedCount === 0) 
            throw "Updating transaction failed!";

        if(type === "debit") {
            let intUpdatedAmount = parseFloat(userInfo.currentAmount) - parseFloat(newAmount);
            let updatedAmount = intUpdatedAmount.toString();
            userInfo.currentAmount = updatedAmount;
            await requireUsers.updateAmount(userInfo);
            userInfo.transactionIds.debit.push(transactionId);
            let toBeComparedDebit = updatedDateTime.toString();
            
            await updateBudgetCategories(toBeComparedDebit, userInfo, newAmount, type, updatedCategory);
        }

        if(type === "credit") {
            let intUpdatedAmount = parseFloat(userInfo.currentAmount) + parseFloat(newAmount);
            let updatedAmount = intUpdatedAmount.toString();
            userInfo.currentAmount = updatedAmount;
            await requireUsers.updateAmount(userInfo);
            userInfo.transactionIds.credit.push(transactionId);
            let toBeComparedCredit = updatedDateTime.toString();
    
            await updateBudgetCategories(toBeComparedCredit, userInfo, newAmount, type, updatedCategory)
        }
    }
    else {
        throw "You do not have enough money to update this transaction!";
    }

    let getNewTransactionDetails = await getTransaction(transactionId);
    
    return getNewTransactionDetails;
}

async function updateBudgetCategories (toBeCompared, getUser, amount, type, category) {
    let isDateEqualBudget = checkDateCurrentBudget(toBeCompared, getUser);

    if (isDateEqualBudget === true) {
        let newCategoryAmount;
        if (type === "debit") {
            newCategoryAmount = parseFloat(getUser.currentBudget.categories[category]) + parseFloat(amount);
        }
        if (type === "credit") {
            newCategoryAmount = parseFloat(getUser.currentBudget.categories[category]) - parseFloat(amount);
        }
        let stringAmount = newCategoryAmount.toString();
        await requireUsers.updateUserCategory(getUser, category, stringAmount);
    }
}

module.exports = {
    addTransaction,
    checkUserBalanceWhenDebit,
    getTransaction,
    resetAndSetCategories,
    resetAndSetStatement,
    checkDateStatementCurrent,
    checkDateCurrentBudget,
    deleteTransaction,
    updateTransaction,
    recentTransactions,
    updateBudgetCategories
};