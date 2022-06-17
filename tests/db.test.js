const mongoose = require('mongoose');

const {MongoClient} = require('mongodb');

const url = "mongodb+srv://SafeShare:sAlWpKNC6jkncmgT@cluster0.apg9o.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url);
const conn = mongoose.createConnection(url)
const dbName = "test";
let db

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

 client.close();
 conn.close();