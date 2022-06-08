const {MongoClient} = require('mongodb');

const url = "mongodb+srv://SafeShare:sAlWpKNC6jkncmgT@cluster0.apg9o.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url);

const dbName = "test";

async function main() {

    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);
        // Use the collection "people"
        const col = db.collection("info");
        // Construct a document                                                                                                                                                              
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
