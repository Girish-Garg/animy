import mongoose from "mongoose";
import videoSchema from "./video.schema";
const { Schema } = mongoose;

const albumSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    albumName: {
        type: String,
        required: true,
    },
    videos: [videoSchema],
}, {
  timestamps: true,
});

const Album = mongoose.model("Album", albumSchema);
export default Album;