const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },

  imageUrl: {
    type: [String], // multiple images
    required: true,
  },

  plantType: {
    type: String,
    required: true,
    index: true,
  },

  sunExposure: {
    type: String,
    enum: ["Full Sun", "Partial Shade", "Shade"],
    required: true,
  },

  soilPH: {
    type: String,
    required: true,
  },

  bloomTime: {
    type: String,
    index: true,
  },

  flowerColor: String,

  overview: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  lifecycle: [
    {
      stage: { type: String, required: true }, // e.g. "Planting", "Growing"
      season: String,
      seedDepth: String,
      spacing: {
        row: String,
        plant: String,
      },
      sowingTips: String,
      irrigationNeeds: String,
      fertilizer: String,
      careTips: [String],
    },
  ],

  pestsAndDiseases: [
    {
      name: String,
      symptoms: String,
      solution: String,
      type: {
        type: String,
        enum: ["Pest", "Disease"],
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Crop = mongoose.model("Crop", cropSchema);
module.exports = Crop;
