import mongoose, { Schema } from "mongoose";
import { systemRoles, providers } from '../../src/utils/systemRoles.js'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        min: 3,
        max: 20,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePicture: {
        secure_url: String,
        public_id: String,
    },

    role: {
        type: String,
        enum: [systemRoles.USER, systemRoles.ADMIN],
        required: true,
        default: systemRoles.USER
    },
    provider: {
        type: String,
        enum: [providers.SYSTEM, providers.GOOGLE, providers.FACEBOOK],
        required: true,
        default: providers.SYSTEM
    },
    coverPicture: {
        secure_url: String,
        public_id: String,
    },
    followers: {
        type: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        default: []
    },
    following: {
        type: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        default: []
    },
    token: {
        type: String,
        default: ''
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    desc: {
        type: String,
        max: 50,
    },
    city: {
        type: String,
        max: 25,
    },
    from: {
        type: String,
        max: 20,
    },
    relationship: {
        type: String,
        enum: ["single", "engaged", "divorced", "not specified"],
        default: "not specified"
    },
    forgetCode: String,
    socketId: String

}, {
    timestamps: true
})

export const userModel = mongoose.model('user', userSchema)