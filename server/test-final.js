import fetch from "node-fetch";

async function run() {
  const payload = {
    name: "Final Test User",
    phone: "7978670852",
    password: "password123"
  };
  console.log("Sending:", payload);
  let res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  let data = await res.json();
  console.log("Response:", data);

  process.exit(0);
}

run().catch(console.error);
