const dbConnection = require("./mongoConnection");

let getCollectionFn = collection => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

module.exports = {
  users: getCollectionFn("users"),
  transactions: getCollectionFn("transactions"),
  budget: getCollectionFn("budget"),
  send: getCollectionFn("send"),
  request: getCollectionFn("request"),
  split: getCollectionFn("split")
};
