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
    const db = client.db(dbName);
    const col = db.collection("info");

    // "model" that will be inserted into databaase
    let infoDoc = {
        "password": req.body.password,
        _id: createId(),
        expired: false
    }
  
    // Insert a single document, wait for promise so we can read it back
     const p = col.insertOne(infoDoc);
  
    // generate link location
    // TODO: fefactor to dyanamically create path using nodejs global var
    const link = "localhost:3000/account/" + infoDoc._id
    
    res.render("accountFormDone", {link: link})
})

router.get("/:id", (req, res) => {
    // query database using req.params.id
    const id = String(req.params.id)
    const db = client.db(dbName)
    const col = db.collection("info")

    const myDoc = col.findOne({_id: id}, {password: 1})
    myDoc.then((result) => {
        // if the id is not in the database, respond with 404
        if (result == null) {
            res.sendStatus(404)
        }
        else {
          const expired = result.expired
          // if link has not expired, render password page
          if (expired == false) {
              const pwd = result.password
              res.render("accountLink", {password: pwd, id: id})
          }
          // if link is expired, respond with 404
          else {
              res.sendStatus(404)
          }
        }
    })
})

router.post("/:id/expire", (req, res) => {
    // database connection
    const db = client.db(dbName)
    const col = db.collection("info")
    
    // update row parameters
    const query = {_id: req.params.id}
    const update = { $set: {expired: true}}
  
    // update row
    col.updateOne(query, update)

    res.render("accountFormExpire")
})

// create a random string of 12 characters
// base-62 character set
function createId() {
    let result = ""
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (var i = 0; i < 12; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result;
}

module.exports = router