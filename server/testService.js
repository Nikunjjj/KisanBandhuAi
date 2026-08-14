import { analyzePlantImage } from "./src/services/plantDoctorService.js";

async function run() {
  try {
    // A 10x10 red square png
    const dummyImage = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FAAHPAf0t3GvDAAAAAElFTkSuQmCC";
    
    const result = await analyzePlantImage({
      imageBase64: dummyImage,
      mimeType: "image/png"
    });
    console.log("Success:", result);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
