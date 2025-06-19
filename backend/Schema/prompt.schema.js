import mongoose from "mongoose";
const { Schema } = mongoose;

const promptSchema = new Schema({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
    },
    prompt: {
        type: String,
        required: true,
    },
    videoPath: {
        type: String,
        required: true,
        index: true,
    },
    statusId: {
        type: String,
        required: true,
        index: true,
        default: null
    },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
    },
    errorMessage: {
        type: String,
        default: null,
    },
}, {
  timestamps: true,
});

const Prompt = mongoose.model("Prompt", promptSchema);
export default Prompt;