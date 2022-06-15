const create = require("./helperFunctions/createId")
const express = require("express")
const router = express.Router()

const { encrypt, decrypt } = require('./helperFunctions/crypto');

require('dotenv').config();

const {MongoClient, ObjectId} = require('mongodb');
const { info } = require("console")

const url = "mongodb+srv://SafeShare:sAlWpKNC6jkncmgT@cluster0.apg9o.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url);

const dbName = "credential";
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

router.get("/", (req, res) => {
    res.sendStatus(404)
})

router.get("/upload", (req, res) => {
    res.render("credential/form")
})

router.post("/upload/done", (req, res) => {
    const db = client.db(dbName);
    const col = db.collection("info");

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

router.get("/:id", (req, res) => {
    // query database using req.params.id
    const id = String(req.params.id)
    const db = client.db(dbName)
    const col = db.collection("info")

    // query database
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
              res.render("credential/link", {id: id})
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

    // id variable
    const id = String(req.params.id)

    // update row parameters
    const query = {_id: id}
    const update = { $set: {expired: true}}

    // update row
    col.updateOne(query, update)
    // col.deleteOne

    // get password from database to render to user
    const myDoc = col.findOne({_id: id}, {password: 1})
    myDoc.then((result) => {
        const password = decrypt(result.password)
        const username = decrypt(result.username)
        res.render("credential/expire", {password: password, username: username})
    })
})

module.exports = router