const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
    let groupMembers = {
        groupNo: "Group - 14",
        members: [
            {
                details: "Maithili Deshmukh - 10454930"
            },
            {
                details: "Saish Sankhe - 10454992"
            },
            {
                details: "Prateek Jani - 10446247"
            },
            {
                details: "Sanket Patidar - 10445969"
            }
        ]
    }

    res.render("user/groupMembers", {groupMembers: groupMembers});
});

module.exports = router;