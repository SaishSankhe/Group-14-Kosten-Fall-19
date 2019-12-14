const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const requireUsers = require("./users")
const bcrypt = require("bcrypt");

async function checkCredentials(userEmail, password) {
    let usersData = await getAllUsers();
    userEmail = userEmail.toLowerCase();
    
    // check if user is registered
    let userInfo = await requireUsers.getUserByEmail(userEmail.trim());
    if (!userInfo) {
      throw "You are not a registered user!";
    }

    if (!userEmail || !password)
      throw "Credentials cannot be left blank!";
    if (userEmail === null || password === null)
      throw "Credentials cannot be null!";
    if (userEmail == "" || password == "")
      throw "Credentials cannot be empty!";

    let compare = false;
    let userId;
    for (let i in usersData)
    {
        if (usersData[i].email === userEmail) {
            compare = await bcrypt.compare(password, usersData[i].password);
            userId = usersData[i]._id;
        }
    }

    if (compare === true) {
      let exportObj = {
        compare: true,
        userId: userId
      }
      
      return exportObj;
    }

    if (compare === false)
      throw "Credentials provided are incorrect!";
}

async function getAllUsers () {
    let usersCollection = await users();
    let allUsers = await usersCollection.find({}).toArray();
    return allUsers;
}

module.exports = {
    checkCredentials,
    getAllUsers
}