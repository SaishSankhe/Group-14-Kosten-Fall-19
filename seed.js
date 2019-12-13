const connection = require("./config/mongoConnection");
const data = require('./data/');
const users = data.users;
const transactions = data.transactions;
const split = data.split;
const requested = data.requested;
const sent = data.sent;
const ObjectId = require('mongodb').ObjectID;

async function main() {
  const db = await connection();
  // await db.dropDatabase();

  // const alice = await users.addUser({
  //   fName: "Alice",
  //   lName: "Roy",
  //   email: "aliceroy@gmail.com",
  //   password: "alicer"
  // });
  // //console.log(alice)

  // const bob = await users.addUser({
  //   fName: "Bob",
  //   lName: "Hogg",
  //   email: "bobhogg@gmail.com",
  //   password: "bobh"
  // });
  // //console.log(bob)

  // const charlie = await users.addUser({
  //   fName: "Charlie",
  //   lName: "Su",
  //   email: "charliesu@gmail.com",
  //   password: "charlies"
  // });
  // //console.log(charlie)

  // const dave = await users.addUser({
  //   fName: "Dave",
  //   lName: "Carr",
  //   email: "davecarr@gmail.com",
  //   password: "davec"
  // });
  // // console.log(dave)

  // const updateDave = await users.updateUser("davecarr@gmail.com", {
  //   fName: "Dave",
  //   lName: "Carlson"
  // });
  // // console.log(updateDave);

  // let dateTime = new Date();
  // let transactionDetailsObj = {
  //   amount: "1",
  //   type: "credit",
  //   date_time: dateTime,
  //   category: "grocery",
  //   transactionName: "My first one!",
  //   split: {
  //       bool: false
  //   }
  // };
  
  // const addTransactionAlice = await transactions.addTransaction(alice._id, transactionDetailsObj);
  // console.log(addTransactionAlice);
  

  // let dateTime2 = new Date();
  // let transactionDetailsObj2 = {
  //   amount: "15",
  //   type: "debit",
  //   date_time: dateTime2,
  //   category: "bills",
  //   transactionName: "My ? one!",
  //   split: {
  //       bool: false
  //   }
  // };
  
  // const addTransactionBob = await transactions.addTransaction(bob._id, transactionDetailsObj2);
  // console.log(addTransactionBob);

  // let transactionDetailsObj3 = {
  //   amount: "100",
  //   type: "credit",
  //   date_time: dateTime2,
  //   category: "grocery",
  //   transactionName: "My first one!",
  //   split: {
  //       bool: false
  //   }
  // };
  
  // const addTransactionDave1 = await transactions.addTransaction(dave._id, transactionDetailsObj3);

  // let transactionDetailsObj4 = {
  //   amount: "100",
  //   type: "credit",
  //   date_time: dateTime2,
  //   category: "bills",
  //   transactionName: "My first one!",
  //   split: {
  //       bool: false
  //   }
  // };
  
  // const addTransactionDave2 = await transactions.addTransaction(dave._id, transactionDetailsObj4);

  // let dateTime2 = new Date();
  // let transactionDetailsObj5 = {
  //   amount: "100",
  //   type: "credit",
  //   date_time: dateTime2,
  //   category: "bills",
  //   transactionName: "My fifth one!",
  //   split: {
  //       bool: false
  //   }
  // };
  
  // const addTransactionDave3 = await transactions.addTransaction(ObjectId("5df064acdf116c12fade2aff"), transactionDetailsObj5);

  // let dateTime3 = new Date();
  // let splitDetailsObj = {
  //   amount: "20",
  //   type: "debit",
  //   date_time: dateTime3,
  //   category: "grocery",
  //   transactionName: "My split first one!",
  //   split: {
  //       bool: true
  //   },
  //   requestFlag: ["bobhogg@gmail.com", "charliesu@gmail.com"]
  // };
  
  // const addTransactionDave = await transactions.addTransaction(ObjectId("5df215717fc28c0f56416b7f"), splitDetailsObj);
  // // //console.log(addTransactionDave);

  // let splitDetailsObj2 = {
  //   amount: "20",
  //   type: "debit",
  //   date_time: dateTime3,
  //   category: "grocery",
  //   transactionName: "My split first one!",
  //   split: {
  //       bool: true
  //   },
  //   requestFlag: ["bobhogg@gmail.com", "charliesu@gmail.com"]
  // };
  
  // const addTransactionDave2 = await transactions.addTransaction(ObjectId("5df2125506da0c0f0a56fd30"), splitDetailsObj2);

  // let splitDetailsObj3 = {
  //   amount: "20",
  //   type: "debit",
  //   date_time: dateTime3,
  //   category: "grocery",
  //   transactionName: "My split first one!",
  //   split: {
  //       bool: true
  //   },
  //   requestFlag: ["bobhogg@gmail.com", "davecarr@gmail.com"]
  // };
  
  // const addTransactionDave3 = await transactions.addTransaction(ObjectId("5df2125106da0c0f0a56fd2f"), splitDetailsObj2);

  // let dateTime5 = new Daç(sendDetailsObj);
  // //console.log(sendMoneyToAlice);

  // //let dateTime5 = new Date();
  // let sendDetailsObj2 = {
  //   senderId: dave._id,
  //   receiverEmail: "bobhogg@gmail.com",
  //   amount: "100",
  //   remark: "Surprise 2",
  //   date_time: dateTime5
  // }
  
  // const sendMoneyToBob = await sent.sendMoney(sendDetailsObj2);
  // // console.log(sendMoneyToBob);

  // let sendDetailsObj3 = {
  //   senderId: alice._id,
  //   receiverEmail: "bobhogg@gmail.com",
  //   amount: "100",
  //   remark: "Surprise 3",
  //   date_time: dateTime5
  // }
  
  // const sendMoneyToBob2 = await sent.sendMoney(sendDetailsObj3);

  // let sendDetailsObj4 = {
  //   senderId: bob._id,
  //   receiverEmail: "aliceroy@gmail.com",
  //   amount: "100",
  //   remark: "Surprise 4",
  //   date_time: dateTime5
  // }
  
  // const sendMoneyToBob3 = await sent.sendMoney(sendDetailsObj4);

  // let dateTime = new Date();
  // let newDetailsObj = {
  //   amount: "15678",
  //   type: "credit",
  //   date_time: dateTime,
  //   category: "grocery",
  //   transactionName: "My updated one!",
  //   split: {
  //       bool: false
  //   }
  // };
  // const updateAliceTransaction = await transactions.updateTransaction2("5df03fba62115b08b2f3838f", newDetailsObj);
  // console.log(updateAliceTransaction);
  
  // const deleteAliceTransaction = await transactions.deleteTransaction(ObjectId("5df024f877cb5706e3136234"));
  // console.log(deleteAliceTransaction);

  // let dateTime5 = new Date();
  // let requestDetailsObj1 = {
  //   requesterId: ObjectId("5df06fe84c889a154f8c0c86"),
  //   granterEmail: "davecarr@gmail.com",
  //   amount: "55",
  //   remark: "Just like this!",
  //   date_time: dateTime5,
  //   requestFlag: false
  // }
  
  // let requestMoneyFromDave = await requested.createRequest(requestDetailsObj1);
  // let acceptMoneyFromDave = await requested.acceptRequest(ObjectId("5df06fe84c889a154f8c0c89"));

  // const splitTransactionAlice = await split.updateSplitCalculation(ObjectId("5dedc2ae41cd620637bdcf60"), "5dedc2ad41cd620637bdcf5a");
  // console.log(splitTransactionAlice);

  const deleteTransaction = await transactions.deleteTransaction("5df2d8366b2125058153f4db");

  await db.serverConfig.close();
}

main().catch(error => {
    console.log(error);
});