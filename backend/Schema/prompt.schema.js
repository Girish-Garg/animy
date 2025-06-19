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
    errorMessage: {
        type: String,
        default: null,
    },
}, {
  timestamps: true,
});

const Prompt = mongoose.model("Prompt", promptSchema);
export default Prompt;