import mongoose from "mongoose";
const { Schema } = mongoose;

const HerdSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    stallion: { type: Schema.Types.ObjectId, ref: "Horse", default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Herd", HerdSchema);
