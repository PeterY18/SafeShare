// expressjs setup
const express = require("express")
const app = express()

// static files setup
// app.use(express.static(__dirname + "/public"))
// app.use("/public", express.static("public"))
app.use("/public", express.static("public"))
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true}))

// ejs setup
const expressLayouts = require('express-ejs-layouts')
app.set("view engine", "ejs")

app.set("views", __dirname + "/views")

app.set('layout', 'layouts/layout')
app.use(expressLayouts)

// credential router
const credentialRouter = require("./routes/credential")
app.use("/credential", credentialRouter)

// file router
const fileRouter = require("./routes/file")
app.use("/file", fileRouter)

app.listen(3000)