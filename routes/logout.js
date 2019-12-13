const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
    req.session.destroy( err => {
      res.clearCookie("AuthCookie");
      res.render("user/logout", {title: "Logged out"});
    });
  });

module.exports = router;