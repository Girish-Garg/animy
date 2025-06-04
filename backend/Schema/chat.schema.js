import mongoose from "mongoose";
const { Schema } = mongoose;

const promptsSchema = new Schema({
    prompt: {
        type: String,
        required: true,
    },
    videoId: {
        type: String,
    },
}, {
  timestamps: true,
});

const chatSchema = new Schema({
    userId : {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    prompts : {
        type: [promptsSchema],
        default: [],
    },
    promptCount : {
        type: Number,
        default: 0,
    },
});


const Chat = mongoose.model("Chat", chatSchema);
export default Chat;