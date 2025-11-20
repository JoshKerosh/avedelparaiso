require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function test() {
  const uri = process.env.MONGODB_URI;
  console.log('Testing connection to:', uri.replace(/:[^:@]+@/, ':****@'));
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db('avedelparaiso');
    const collections = await db.listCollections().toArray();
    console.log('✅ Can list collections:', collections.map(c => c.name));
    
    const users = db.collection('users');
    const count = await users.countDocuments();
    console.log('✅ Can count documents:', count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

test();
