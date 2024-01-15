const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authSchema = new Schema({
    username: {
        type: String,
        //unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        //minLength: 8
    },
    role: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;