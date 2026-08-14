import fetch from "node-fetch";

async function run() {
  let res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Phone User 10",
      phone: "7978670850",
      password: "password123"
    })
  });
  let data = await res.json();
  console.log("Register 1:", data);

  res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Phone User 11",
      phone: "7978670851",
      password: "password123"
    })
  });
  data = await res.json();
  console.log("Register 2:", data);

  process.exit(0);
}

run().catch(console.error);
