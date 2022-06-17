const createId = require("./helperFunctions/createId")
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
const checkExpired = require("./helperFunctions/checkExpired")


router.use(bodyParser.json())
router.use(methodOverride("_method"))

const {MongoClient, ObjectId} = require('mongodb');
const { info } = require("console")
const { create } = require("domain")

const url = "mongodb+srv://SafeShare:sAlWpKNC6jkncmgT@cluster0.apg9o.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url);
const conn = mongoose.createConnection(url)

const day = 86400000

const dbName = "file";
// open database connection
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

let gfs, gridfsBucket
conn.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    })
    gfs = Grid(conn.db, mongoose.mongo)
    gfs.collection("uploads")
})

let id = createId.createId()
const storage = new GridFsStorage({
    url: url,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = file.originalname;
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads',
                id: id,
            };
            resolve(fileInfo);
        });
    }
  });

const upload = multer({ storage });

router.get("/", (req, res) => {
    res.sendStatus(404)
})

// upload file form
router.get("/upload", (req, res) => {
    res.render("file/form")
})

/*
 * Uploads user file and creates link for download
 */
router.post("/upload/done", upload.single("file"), (req, res) => {
    const link = "localhost:3000/file/" + id

    const db = client.db(dbName);
    const col = db.collection("file");

    let fileDoc = {
        id: id,
        // expiredBy: Date.now() + (day * 1),
        expiredBy: Date.now() + 1,
        expired: false
    }
    
    const p = col.insertOne(fileDoc);

    res.render("file/formDone", {link: link})
})

/*
 * User with link will render this page
 * Page has button to download file
 */
router.get("/:id", (req, res) => {
    const linkId = req.params.id
    const db = client.db(dbName)
    const col = db.collection("info")
    const fileCol = db.collection("file")

    const myDoc = gfs.collection("uploads").findOne({_id: linkId}, {password: 1})
    const fileDoc = fileCol.findOne({id: linkId}, {password: 1})
    myDoc.then((result) => {
        if (result == null) {
            res.sendStatus(404)
        }
        else {
            fileDoc.then((innerResult) => {
                console.log(innerResult)
                const dateExpired = innerResult.expiredBy
                if (Date.now() > dateExpired) {
                    res.sendStatus(404)
                    fileCol.updateOne({id: linkId}, {$set: {expired: true}})
                }
                else {
                    res.render("file/download", {id: linkId})
                }
            })
        }
    })
})

/* 
 * Download file to user's local computer
 */
router.post("/:id", (req, res) => {
    const linkId = req.params.id

    const myDoc = gfs.collection("uploads").findOne({_id: linkId}, {password: 1})
    myDoc.then((result) => {
        let mimeType = result.contentType
        res.set({
            "Content-Type": mimeType,
            "Content-Disposition": "attatchmenet; filename=" + result.filename
        })
        const readStream = gridfsBucket.openDownloadStream(linkId);
        readStream.pipe(res);
    })
})

// import schedule from "node-schedule"
const schedule = require("node-schedule")
schedule.scheduleJob('0 0 * * *', () => {
    const db = client.db(dbName)
    const fileCol = db.collection("file")
    fileCol.deleteMany({expired: true})
})

module.exports = router