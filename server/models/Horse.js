import mongoose from "mongoose";
const { Schema } = mongoose;

const HorseSchema = new Schema(
  {
    horseId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, trim: true },
    birthYear: { type: Number, min: 1900, max: new Date().getFullYear() + 1 },
    sex: { type: String, enum: ["male", "female"], required: true },
    color: { type: String, trim: true },
    owner: { type: String, trim: true },
    lineage: { type: String, trim: true },
    brandMark: { type: String, trim: true },
    sire: { type: Schema.Types.ObjectId, ref: "Horse", default: null },
    dam: { type: Schema.Types.ObjectId, ref: "Horse", default: null },
    offspring: [{ type: Schema.Types.ObjectId, ref: "Horse" }],
    herd: { type: Schema.Types.ObjectId, ref: "Herd", default: null }
  },
  { timestamps: true }
);

HorseSchema.index({ horseId: 1 }, { unique: true });
HorseSchema.index({ name: "text", owner: "text", color: "text", lineage: "text", brandMark: "text" });

export default mongoose.model("Horse", HorseSchema);
