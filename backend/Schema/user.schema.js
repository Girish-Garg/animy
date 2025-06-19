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
    totalCredit : {
        type: Number,
        default: 1000,
    },
    usedCredit : {
        type: Number,
        default: 0,
    },
    CostPerCredit : {
        type : Number,
        default : 5,
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


userSchema.virtual("creditRemaining").get(function () {
  return this.totalCredit - this.usedCredit;
});

const User = mongoose.model("User", userSchema);
export default User;