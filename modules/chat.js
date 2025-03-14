const mongoose = require('mongoose');
const S = mongoose.Schema;

const userSchema = new S({
    email: {
        required: true,
        type: String,
        unique: true
    },
    chat: {
        required: true,
        type: [
            {
            message: { type: String, required: true },
            response: { type: String, required: true }
            }
        ]
    }
});

module.exports = mongoose.model('Chat', userSchema);