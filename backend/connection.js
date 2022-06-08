const {MongoClient} = require('mongodb');

// url to db
const url = "mongodb+srv://SafeShare:sAlWpKNC6jkncmgT@cluster0.apg9o.mongodb.net/?retryWrites=true&w=majority"

// creates connection variable
const client = new MongoClient(url);

// db name
const dbName = "test";

async function main() {

    try {
        await client.connect();
        // prints to console
        console.log("Connected correctly to server");

        // creates new db
        const db = client.db(dbName);

        // creates the collection "info"
        const col = db.collection("info");

        // Construct a document to add to info                                                                                                                                                            
        let infoDoc = {
            "pass": "password"
        }

        // Insert a single document, wait for promise so we can read it back
        const p = await col.insertOne(infoDoc);

        // Find one document
        const myDoc = await col.findOne();
        
        // Print to the console
        console.log(myDoc);
       } catch (err) {
        // print error
        console.log(err.stack);
    }

    finally {
       await client.close();
   }
}

main().catch(console.dir);

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
