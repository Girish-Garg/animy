import mongoose from "mongoose";
const { Schema } = mongoose;

const videoSchema = new Schema({
    name: {
        type: String,
        default: "Untitled Video",
        trim: true,
    },
    videoPath: {
        type: String,
        required: true,
        index: true,
    },
    thumbnailPath: {
        type: String,
        required: true,
        index: true,
    },
}, {
    timestamps: true
});

export default videoSchema;
