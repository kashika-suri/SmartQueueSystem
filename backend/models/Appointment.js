const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({

    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    doctor: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    token: {
        type: Number,
        required: true
    },

    // Queue Position
    queuePosition: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: [
            "Waiting",
            "In Progress",
            "Completed",
            "Cancelled"
        ],
        default: "Waiting"
    },

    // Estimated Waiting Time (minutes)
    waitingTime: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);