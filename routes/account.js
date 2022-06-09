const express = require("express")
const router = express.Router()

const crypto = require("crypto")
const algorithm = "aes-256-cbc"
const initVector = crypto.randomBytes(16)
const securityKey = crypto.randomBytes(32)
const cipher = crypto-crypto.createCipheriv(algorithm, securityKey, initVector)

require('dotenv').config();

const {MongoClient, ObjectId} = require('mongodb');
const { info } = require("console")

const url = "mongodb+srv://SafeShare:sAlWpKNC6jkncmgT@cluster0.apg9o.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url);

const dbName = "account";

router.get("/", (req, res) => {
    res.sendStatus(404)
})

router.get("/upload", (req, res) => {
    res.render("accountForm")
})

async function main() {

    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);
        // Use the collection "people"
       } catch (err) {
        console.log(err.stack);
    }
}

router.post("/upload/done", (req, res) => {
    // send password to database
    
    const db = client.db(dbName);
    const col = db.collection("info");

    let infoDoc = {
        "password": req.body.password,
        _id: createId()
    }
    // Insert a single document, wait for promise so we can read it back
    /*
    console.log("Before DB insert")
    console.log("password: " + infoDoc.password)
    console.log("id: " + infoDoc._id)
    console.log()
    */
    const p = col.insertOne(infoDoc);
    // Find one document
    const searchId = new ObjectId(infoDoc.id)
    // const myDoc = col.findOne(searchId);
    const myDoc = col.findOne({_id: infoDoc._id}, {password: 1, _id: 0})
    // Print to the console
    /*
    console.log("After DB insert")
    console.log(myDoc);
    myDoc.then((result) => {
        console.log(result)
    })
    */


    // console.log(col.findOne(1))


    const link = "localhost:3000/account/" + infoDoc._id + "/download"
    res.render("accountFormDone", {link: link})
})

router.get("/:id/download", (req, res) => {
    // query database using req.params.id
    const id = String(req.params.id)
    const db = client.db(dbName);
    const col = db.collection("info");
    var password = ""

    const myDoc = col.findOne({_id: id}, {password: 1})
    const a = myDoc.then((result) => {
        const c = result.password
        // console.log(result.password)
        // return password with that id
        res.render("accountLink", {password: c})
    })
})

function createId() {
    let result = ""
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (var i = 0; i < 12; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result;
}

module.exports = router