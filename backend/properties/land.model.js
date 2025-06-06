import mongoose from "mongoose";

const landSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    unique: true
  },
  size: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['sqft', 'sqm'],
    default: 'sqft',
  },
  price: {
    type: Number,
    required: true
  },
  /*owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  }*/
}, { timestamps: true });

export default mongoose.model("Land", landSchema);
