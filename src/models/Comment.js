const mongoose = require('mongoose');
const { LIMITS } = require('../constants');

const commentSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true,
        index: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    text: {
        type: String,
        required: [true, 'Comment text is required'],
        trim: true,
        maxlength: [LIMITS.COMMENT_TEXT_MAX, `Comment cannot exceed ${LIMITS.COMMENT_TEXT_MAX} characters`]
    },
    upvotes: {
        type: Number,
        default: 0,
        min: 0
    },
    downvotes: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for net votes
commentSchema.virtual('netVotes').get(function () {
    return this.upvotes - this.downvotes;
});

// Compound index for efficient queries
commentSchema.index({ story: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
