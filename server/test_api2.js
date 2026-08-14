import dotenv from "dotenv";
dotenv.config();
import { analyzePlantImage } from "./src/services/plantDoctorService.js";

async function run() {
  try {
    const dummyImage = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2P8z8Dwn4GBgQGIgAAAF4gB+wXy8fMAAAAASUVORK5CYII=";
    const result = await analyzePlantImage({
      imageBase64: dummyImage,
      mimeType: "image/png"
    });
    console.log("Success:", result.cropIdentified);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
