import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type: String,
        required: true,
    },
    totalCount : {
        type: Number,
        default: 0,
    },
    chatId : {
        type: Schema.Types.ObjectId,
        ref: "Chat",
    },
}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);
export default User;