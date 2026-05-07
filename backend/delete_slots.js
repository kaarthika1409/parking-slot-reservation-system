const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('parking_db');
    const slots = database.collection('slots');

    // Delete all slots in "Common Area"
    const result = await slots.deleteMany({ location: "Common Area" });
    console.log("Deleted " + result.deletedCount + " slots from Common Area.");
  } finally {
    await client.close();
  }
}
main().catch(console.dir);
