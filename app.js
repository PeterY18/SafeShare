// expressjs setup
const express = require("express")
const app = express()

// static files setup
// app.use(express.static(__dirname + "/public"))
app.use("/public", express.static("public"))
app.use(express.urlencoded({ extended: true}))

// ejs setup
const expressLayouts = require('express-ejs-layouts')
app.set("view engine", "ejs")

app.set("views", __dirname + "/views")

app.set('layout', 'layouts/layout')
app.use(expressLayouts)

// account router
const accountRouter = require("./routes/account")
app.use("/account", accountRouter)

// file router
const fileRouter = require("./routes/file")
app.use("/file", fileRouter)

app.listen(3000)