import mongoose from "mongoose";

const weatherDataSchema = new mongoose.Schema(
  {
    district: { type: String, required: true, trim: true, index: true },
    state: { type: String, trim: true },
    temperature: { type: Number, required: true },
    feelsLike: Number,
    humidity: Number,
    rainfall: Number,
    rainfallProbability: Number,
    windSpeed: Number,
    windDirection: String,
    pressure: Number,
    uvIndex: Number,
    cloudCoverage: Number,
    sunrise: String,
    sunset: String,
    condition: String,
    forecast: [{ type: mongoose.Schema.Types.Mixed }]
  },
  { timestamps: true }
);

export const WeatherData = mongoose.model("WeatherData", weatherDataSchema);
