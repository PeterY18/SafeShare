const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
    res.sendStatus(404)
})

router.get("/upload", (req, res) => {
    res.render("accountForm")
})

router.post("/upload/done", (req, res) => {
    res.render("accountFormDone", {password: req.body.password})
})

router.get("/:id/download", (req, res) => {
    console.log(req.params.id)
    // query database using req.params.id

    // return password with that id
    res.render("accountLink")
})

module.exports = router