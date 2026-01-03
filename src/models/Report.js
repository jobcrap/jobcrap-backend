const mongoose = require('mongoose');
const { REPORT_STATUS } = require('../constants');

const reportSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true,
        index: true
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: [true, 'Report reason is required'],
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: Object.values(REPORT_STATUS),
        default: REPORT_STATUS.PENDING,
        index: true
    },
    adminNote: {
        type: String,
        maxlength: 1000
    }
}, {
    timestamps: true
});

// Indexes
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
