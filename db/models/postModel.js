import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    desc: {
        type: String,
        max: 500,
        trim: true,
    },
    medias: [{
        secure_url: { type: String },
        public_id: { type: String },
    }],
    likes: {
        type: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        default: []
    },
},
    {
        timestamps: true

    })

export const postModel = mongoose.model('post', postSchema)