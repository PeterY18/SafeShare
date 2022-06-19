// expressjs routing setup
const express = require("express")
const router = express.Router()

// load environment variables
require('dotenv').config();

// mongodb and file uploads
const mongoose = require("mongoose")
const multer = require("multer")
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage
const Grid = require("gridfs-stream")
const bodyParser = require("body-parser")
const methodOverride = require("method-override")
router.use(bodyParser.json())
router.use(methodOverride("_method"))
const {MongoClient} = require("mongodb");

// helper functions
const { encrypt, decrypt } = require("./helperFunctions/crypto")
const createId = require("./helperFunctions/createId")

// mongodb connection constants
const url = process.env.DB_URL
const client = new MongoClient(url)
const conn = mongoose.createConnection(url)
const dbName = "file";

const day = 86400000

// setup GridFS for mongodb
let gfs, gridfsBucket
conn.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    })
    gfs = Grid(conn.db, mongoose.mongo)
    gfs.collection("uploads")
})

// setup multer to work with GridFS
let id = createId.createId()
const storage = new GridFsStorage({
    url: url,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = encrypt(file.originalname);
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

// there is no route for "/"
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
    console.log(res)

    let fileDoc = {
        id: id,
        expiredBy: Date.now() + (day * 1),
        // expiredBy: Date.now() + 1,
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


    const load = async () => {
        try {
            const myDoc = await gfs.collection("uploads").findOne({_id: linkId}, {password: 1})
            const fileDoc = await fileCol.findOne({id: linkId}, {password: 1})

            if (myDoc == null) {
                res.sendStatus(404)
            }
            else {
                const dateExpired = fileDoc.expiredBy
                if (Date.now() > dateExpired) {
                    res.sendStatus(404)
                    fileCol.updateOne({id: linkId}, {$set: {expired: true}})
                }
                else {
                    res.render("file/download", {id: linkId})
                }
 
            }
        }
        catch (err) {
            res.render(500)
            console.log(err)
        }
    }
    load()
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
            "Content-Disposition": "attatchmenet; filename=" + decrypt(result.filename)
        })
        const readStream = gridfsBucket.openDownloadStream(linkId);
        readStream.pipe(res);
    })
})

// import schedule from "node-schedule"
// Delete expired files at midnight
const schedule = require("node-schedule")
schedule.scheduleJob('0 0 * * *', () => {
    const db = client.db(dbName)
    const fileCol = db.collection("file")
    fileCol.deleteMany({expired: true})
})

module.exports = router