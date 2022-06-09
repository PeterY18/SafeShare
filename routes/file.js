
const express = require("express")
const router = express.Router()

const bodyParser = require("body-parser")
const path = require("path")
const mongoose = require("mongoose")
const multer = require("multer")
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage
const Grid = require("gridfs-stream")
const methodOverride = require("method-override")

const {MongoClient, ObjectId} = require('mongodb');
const { info } = require("console")

const url = "mongodb+srv://SafeShare:sAlWpKNC6jkncmgT@cluster0.apg9o.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url);

const dbName = "account";

router.get("/", (req, res) => {
    res.sendStatus(404)
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

router.get("/upload", (req, res) => {
    res.render("fileForm")
})

router.post("/upload/done", (req, res) => {
    const db = client.db(dbName);
    const col = db.collection("info");

    let infoDoc = {
        _id: createId(),
        expired: false,
        created: Date.now()
    }

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