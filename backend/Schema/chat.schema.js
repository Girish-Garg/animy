import mongoose from "mongoose";
const { Schema } = mongoose;

const chatSchema = new Schema({
    userId : {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    prompts : [{
        type: Schema.Types.ObjectId,
        ref: "Prompt",
    }],
},{
    timestamps: true,
}
);
const Chat = mongoose.model("Chat", chatSchema);
export default Chat;