import mongoose from "mongoose";
import videoSchema from "./video.schema.js";
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
    video: {
        type: videoSchema,
        required: function() {
            return this.status === "completed";
        }
    },
    status: {
        type: String,
        enum: ["processing", "completed", "failed", "cancelled"],
        default: "processing",
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