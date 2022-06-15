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
            id = createId.createId()
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

const dbName = "file";

router.get("/", (req, res) => {
    res.sendStatus(404)
})

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

// upload file form
router.get("/upload", (req, res) => {
    res.render("fileForm")
})

/*
 * Uploads user file and creates link for download
 */
router.post("/upload/done", upload.single("file"), (req, res) => {
    const link = "localhost:3000/file/" + id
    res.render("fileFormDone", {link: link})
})

/*
 * User with link will render this page
 * Page has button to download file
 */
router.get("/:id", (req, res) => {
    const linkId = req.params.id
    const db = client.db(dbName)
    const col = db.collection("info")

    const myDoc = gfs.collection("uploads").findOne({_id: linkId}, {password: 1})
    myDoc.then((result) => {
        if (result == null) {
            res.sendStatus(404)
        }
        else {
            const dateMade = result.uploadDate
            // console.log(result)
            // console.log(dateMade)
            // console.log(typeof dateMade)
            res.render("fileLink", {id: linkId})
        }
    })
})

/* 
 * Download file to user's local computer
 */
router.post("/:id", (req, res) => {
    const linkId = req.params.id
    const db = client.db(dbName)
    const col = db.collection("info")

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

module.exports = router