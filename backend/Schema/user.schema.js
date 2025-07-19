import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
    clerkId : {
        type: String,
        required: true,
        unique: true,
    },
    email : {
        type: String,
        required: true,
        unique: true,
    },
    chatIds : [{
        type: Schema.Types.ObjectId,
        ref: "Chat",
    }],
    albumIds : [{
        type: Schema.Types.ObjectId,
        ref: "Album",
    }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const User = mongoose.model("User", userSchema);
export default User;