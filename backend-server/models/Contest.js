const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);