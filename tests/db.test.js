const mongoose = require('mongoose');
const multer = require("multer")
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage
const Grid = require("gridfs-stream")
const express = require("express")
const router = express.Router()

const {MongoClient} = require('mongodb');

const url = "mongodb+srv://SafeShare:sAlWpKNC6jkncmgT@cluster0.apg9o.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url);
const conn = mongoose.createConnection(url)
const dbName = "test";
let db
let gfs
let gridfsBucket

const items = mongoose.model("test", mongoose.Schema({
    name: String
}))

async function main() {
    client.connect();
    db = client.db(dbName);
}

 afterAll(done => {
    done();
 });

 test("connection established", () => {
    expect(db).not.toBe(null);
 });

 test("collection created", () => {
    const col = conn.createCollection("testCol")

    expect(col).not.toBe(null)
    conn.dropCollection(col)
 })

 test("item stores in db", () => {
    const col = conn.createCollection("testCol")
    const response = items.create({
        name: "NAME"
    });

    items.insertMany(response)
    let i = items.find(response)

    expect(i).not.toBe(null)
    conn.dropCollection(col)
 })

 test("file uploads", () => {
   const storage = new GridFsStorage({
      url: url,
      file: (req, file) => {
          return new Promise((resolve, reject) => {
              const fileInfo = {
                  fileName: fileName,
                  bucketName: 'testFiles'
              };
              resolve(fileInfo);
         });
      }
   });

   const upload = multer({ storage });

   conn.once("open", () => {
      gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
         bucketName: 'testFiles'
      })
   })

   router.post("/upload/done", upload.single("file"), (req, res) => {
      const db = client.db(dbName);
      const col = db.collection("testFiles");
  
      let fileDoc = {
         fileName: "NAME"
      }
      
      const p = col.insertOne(fileDoc);
  })

  router.get("/:id", (req, res) => {
      const db = client.db(dbName)
      const col = db.collection("tester")
      const fileCol = db.collection("testFiles")

      const myDoc = gfs.collection("testFiles").findOne()
      const fileDoc = fileCol.findOne()

      expect(fileDoc).not.toBe(null)
      gfs.dropCollection("testFiles")
   })
 })

 test("item deletes from db", () => {
   const col = conn.createCollection("testCol")
   const response = items.create({
       name: "NAME"
   });

   items.insertMany(response)
   items.findByIdAndRemove(response.id)

   expect(items.findById(response.id)).not.toBe(null)
   conn.dropCollection(col)
})

 client.close();
 conn.close();