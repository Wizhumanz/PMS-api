const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            trim: true,
            default: '',
        },
        lastName: { type: String, trim: true, default: '' },
        age: { type: Number, min: 1 },
        username: {
            type: String,
            trim: true,
            unique: true,
            required: 'Username is required',
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: 'Email is required.',
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email address and try again.',
            ],
            role: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Role',
                },
            ],
        },
        password: {
            type: String,
            trim: true,
            required: 'At-least five characters password is required.',
            minlength: 5,
        },
        verified: {
            type: Boolean,
            default: false
        },
        company: { 
            type: String,
            default: ''
        },
        profileRole: {
            type: String,
            trim: true,
            default: ''
        },
        country: { 
            type: String,
            default: ''
        },
        state: { 
            type: String,
            default: ''
        },
        phone: { 
            type: String,
            default: ''
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

const User = mongoose.model('User', userSchema)
module.exports = User