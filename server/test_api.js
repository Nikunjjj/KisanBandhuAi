const fs = require('fs');
fetch('http://localhost:5000/api/ai/plant-doctor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Fake token since we need one, wait, plant doctor is protected!
  },
  body: JSON.stringify({
    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2P8z8Dwn4GBgQGIgAAAF4gB+wXy8fMAAAAASUVORK5CYII="
  })
}).then(r => r.text()).then(console.log);
