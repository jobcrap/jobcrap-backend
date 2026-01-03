const mongoose = require('mongoose');
const { VOTE_TYPES } = require('../constants');

const voteSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        index: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    voteType: {
        type: String,
        required: true,
        enum: {
            values: Object.values(VOTE_TYPES),
            message: '{VALUE} is not a valid vote type'
        }
    }
}, {
    timestamps: true
});

// Compound unique index - one vote per user per story OR comment
voteSchema.index({ story: 1, user: 1 }, { unique: true, partialFilterExpression: { story: { $exists: true } } });
voteSchema.index({ comment: 1, user: 1 }, { unique: true, partialFilterExpression: { comment: { $exists: true } } });

// Ensure either story or comment is provided, but not both or neither
voteSchema.pre('validate', function(next) {
    if ((this.story && this.comment) || (!this.story && !this.comment)) {
        next(new Error('Vote must be associated with either a story or a comment, not both.'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Vote', voteSchema);
