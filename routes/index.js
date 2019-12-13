const loginRoutes = require("./login");
const dashboardRoutes = require("./dashboard");
const logoutRoutes = require("./logout");
const path = require("path");

const constructorMethod = app => {
  app.use("/login", loginRoutes);
  app.use("/dashboard", dashboardRoutes);
  app.use("/logout", logoutRoutes);
  // app.get("/", (req, res) => {
  //   res.render("user/login-form");
  // });
};

module.exports = constructorMethod;