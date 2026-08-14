import fs from "fs";

async function run() {
  const { env } = await import('./src/config/env.js');
  const { connectDb } = await import('./src/config/db.js');
  await connectDb();
  const { User } = await import('./src/models/User.js');
  const user = await User.findOne();
  
  const { signToken } = await import('./src/utils/token.js');
  const token = signToken(user.toSafeObject());
  
  // Download a sample plant image
  const imgRes = await fetch("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Tomato_leaf_blight.jpg/512px-Tomato_leaf_blight.jpg");
  const arrayBuffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  
  const res = await fetch('http://localhost:5000/api/plant-doctor/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      imageBase64: 'data:image/jpeg;base64,' + base64,
      mimeType: 'image/jpeg'
    })
  });
  
  const text = await res.text();
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', text);
  process.exit(0);
}
run().catch(console.error);
