// expressjs routing setup
const express = require("express")
const router = express.Router()

// load environment variables
require('dotenv').config()

// helper functions
const { encrypt, decrypt } = require('./helperFunctions/crypto')
const create = require("./helperFunctions/createId")

// mongodb connection constants
const {MongoClient} = require('mongodb')
const url = process.env.DB_URL
const client = new MongoClient(url)
const dbName = "credential"

async function main() {
    try {
        await client.connect()
        console.log("Connected correctly to server")
        const db = client.db(dbName)
       } catch (err) {
        console.log(err.stack)
    }
}

// there is no route for "/"
router.get("/", (req, res) => {
    res.sendStatus(404)
})

// renders a form for the user to enter username and password
router.get("/upload", (req, res) => {
    res.render("credential/form")
})

// handle user submitted username and password
router.post("/upload/done", (req, res) => {
    // db connection constants
    const db = client.db(dbName);
    const col = db.collection("info");

    // encrypt username and password
    const username = encrypt(req.body.username);
    const password = encrypt(req.body.password);

    // "model" that will be inserted into databaase
    let infoDoc = {
        "username": username,
        "password": password,
        _id: create.createId(),
        expired: false
    }
  
    // Insert a single document, wait for promise so we can read it back
     const p = col.insertOne(infoDoc);
  
    // generate link location
    // TODO: fefactor to dyanamically create path using nodejs global var
    const link = "localhost:3000/credential/" + infoDoc._id
    
    res.render("credential/formDone", {link: link})
})

// user enters link to access button to reveal crednetials
router.get("/:id", (req, res) => {
    // query database using req.params.id
    const id = String(req.params.id)
    const db = client.db(dbName)
    const col = db.collection("info")

    // query database
    const myDoc = col.findOne({_id: id}, {password: 1})
    myDoc.then((result) => {
        // if the id is not in the database, respond with 404
        if (result === null) {
            res.sendStatus(404)
        }
        else {
            res.render("credential/link", {id: id})
        }
    })
})

// user clicked on link, reveals credential, and expires link
router.post("/:id/expire", (req, res) => {
    // database connection
    const db = client.db(dbName)
    const col = db.collection("info")

    // id variable
    const id = String(req.params.id)

    // get password from database to render to user
    const myDoc = col.findOne({_id: id}, {password: 1})
    myDoc.then((result) => {
        // decrypt information
        const password = decrypt(result.password)
        const username = decrypt(result.username)

        // delete crednetial from database
        col.deleteOne({_id: id}, {password: 1})
        res.render("credential/expire", {password: password, username: username})
    })
})

module.exports = router