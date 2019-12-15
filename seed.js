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
  await db.dropDatabase();

  const alice = await users.addUser({
    fName: "Alice",
    lName: "Roy",
    email: "aliceroy@gmail.com",
    password: "alicer"
  });

  const bob = await users.addUser({
    fName: "Bob",
    lName: "Hogg",
    email: "bobhogg@gmail.com",
    password: "bobh"
  });

  await db.serverConfig.close();
}

main().catch(error => {
    console.log(error);
});