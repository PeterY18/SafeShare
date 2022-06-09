// expressjs setup
const express = require("express")
const app = express()

// static files setup
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true}))

// ejs setup
app.set("view engine", "ejs")

// account router
const accountRouter = require("./routes/account")
app.use("/account", accountRouter)

// file router
const fileRouter = require("./routes/file")
app.use("/file", fileRouter)

app.listen(3000)