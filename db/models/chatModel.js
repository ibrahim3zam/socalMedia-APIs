import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
    pOne: {
        type: Schema.Types.ObjectId, ref: 'user', required: true,
    },
    pTwo: {
        type: Schema.Types.ObjectId, ref: 'user', required: true,
    },

    messages: [{
        from: { type: Schema.Types.ObjectId },
        to: { type: Schema.Types.ObjectId },
        message: { type: String, trim: true, required: true }
    }],
},
    {
        timestamps: true
    })

export const chatModel = mongoose.model('chat', chatSchema)