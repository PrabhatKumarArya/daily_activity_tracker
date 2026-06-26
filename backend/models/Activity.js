const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    icon: {
        type: String,
        default: "task"
    },
    title: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    checked: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Activity",activitySchema);