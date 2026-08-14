import fetch from "node-fetch";

async function run() {
  try {
    let res = await fetch("http://127.0.0.1:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Email User 4",
        email: "emailuser4@example.com",
        password: "password123"
      })
    });
    let data = await res.json();
    console.log("Register Email Only:", data);
  } catch (e) { console.error("Error 1", e); }

  try {
    let res = await fetch("http://127.0.0.1:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: "+911122334466",
        password: "password123"
      })
    });
    let data = await res.json();
    console.log("Login with Phone:", data);
  } catch (e) { console.error("Error 2", e); }

  process.exit(0);
}

run().catch(console.error);
