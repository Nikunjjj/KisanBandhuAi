import fs from "fs";

async function run() {
  const { env } = await import('./src/config/env.js');
  const { connectDb } = await import('./src/config/db.js');
  await connectDb();
  const { User } = await import('./src/models/User.js');
  const user = await User.findOne();
  
  const { signToken } = await import('./src/utils/token.js');
  const token = signToken(user.toSafeObject());
  
  // Use a tiny 1x1 RED pixel PNG
  const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  
  const res = await fetch('http://localhost:5000/api/plant-doctor/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      imageBase64: 'data:image/png;base64,' + base64,
      mimeType: 'image/png'
    })
  });
  
  const text = await res.text();
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', text);
  process.exit(0);
}
run().catch(console.error);
