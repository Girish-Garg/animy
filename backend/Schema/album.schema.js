import mongoose from "mongoose";
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
    videoPaths: [{
        type: String,
        required: true,
    }],
}, {
  timestamps: true,
});

const Album = mongoose.model("Album", albumSchema);
export default Album;