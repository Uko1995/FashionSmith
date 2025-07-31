import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://uwattuko:gnnhxisbnd@cluster-fashionsmith.e1u58iy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-fashionsmith';

(async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('fashionsmith');
    
    console.log('Checking verification records...');
    const verifications = await db.collection('userVerifications').find({}).toArray();
    console.log('Found', verifications.length, 'verification records');
    
    if (verifications.length > 0) {
      const latest = verifications[verifications.length - 1];
      console.log('Latest verification token:', latest.uniqueString);
      console.log('Email:', latest.email);
      console.log('Expires at:', latest.expiresAt);
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
})();
