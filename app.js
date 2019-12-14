const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const session = require('express-session');
const methodOverride = require('method-override');

const exphbs = require('express-handlebars');

const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const resetpassRouter = require("./routes/resetpass");
const logoutRouter = require("./routes/logout");
const dashbaordRouter = require("./routes/dashboard");
const transactionRouter = require("./routes/transaction");
const recentTransactionsRouter = require("./routes/recentTransactions");
const sendRouter = require("./routes/send");
const requestRouter = require("./routes/request");
const statementRouter = require("./routes/statement");
const budgetRouter = require("./routes/budget");

app.use('/public', static);
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}));
app.use(session({
  secret: 'very secret string!',
  resave: false,
  saveUninitialized: true
}));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});

const redirectPrivate = (req, res, next) => {
  if(!req.session.userId) {
      res.status(403).render("user/login-form", {error: "You are not logged in! Please Login or Signup.", class: "error", title: "Login"})
  }
  else
    next();
}

app.get("/", async (req, res) => {
  if(!req.session.userId)
    res.render("user/login-form", {title: "Login"});
  else
    res.redirect("/dashboard");
});

app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/dashboard", redirectPrivate, dashbaordRouter);
app.use("/signup", signupRouter);
app.use("/transaction", redirectPrivate, transactionRouter);
// app.use("/resetpass", resetpassRouter);
app.use("/recentTransactions", redirectPrivate, recentTransactionsRouter);
app.use("/send", redirectPrivate, sendRouter);
app.use("/request", redirectPrivate, requestRouter);
app.use("/statement", redirectPrivate, statementRouter);
app.use("/budget", redirectPrivate, budgetRouter);
