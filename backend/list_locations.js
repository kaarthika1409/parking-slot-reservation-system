const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('parking_db');
    const slots = database.collection('slots');

    const locations = await slots.distinct("location");
    console.log("Distinct locations:", locations);
    
    // Also print total count
    const total = await slots.countDocuments();
    console.log("Total slots in db:", total);
  } finally {
    await client.close();
  }
}
main().catch(console.dir);
