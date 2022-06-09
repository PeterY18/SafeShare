
const express = require("express")
const router = express.Router()

const bodyParser = require("body-parser")
const path = require("path")
const mongoose = require("mongoose")
const multer = require("multer")
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage
const Grid = require("gridfs-stream")
const methodOverride = require("method-override")
const crypto = require("crypto")


router.use(bodyParser.json())
router.use(methodOverride("_method"))

const {MongoClient, ObjectId} = require('mongodb');
const { info } = require("console")
const { create } = require("domain")

const url = "mongodb+srv://SafeShare:sAlWpKNC6jkncmgT@cluster0.apg9o.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url);
const conn = mongoose.createConnection(url)

let gfs, gridfsBucket
conn.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    })
    gfs = Grid(conn.db, mongoose.mongo)
    gfs.collection("uploads")
})

let id = ""
const storage = new GridFsStorage({
    url: url,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = file.originalname;
            id = createId()
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads',
                id: id,
                expired: false,
            };
            resolve(fileInfo);
        });
    }
  });
const upload = multer({ storage });

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

router.post("/upload/done", upload.single("file"), (req, res) => {
    // const cursor = upload.find({id})
    // console.log(id)

    const db = client.db(dbName)
    const col = db.collection("info")
    // const myDoc = col.findOne({_id: id}, {password: 1})

    const myDoc = gfs.collection("uploads").findOne({_id: id}, {password: 1})
    myDoc.then((result) => {
        console.log(result)
        let mimeType = result.contentType
        res.set({
            "Content-Type": mimeType,
            "Content-Disposition": "attatchmenet; filename=" + result.filename
        })
        const readStream = gridfsBucket.openDownloadStream(id);
        readStream.pipe(res);

    })
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