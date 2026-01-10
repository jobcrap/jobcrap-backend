const mongoose = require('mongoose');
const { STORY_CATEGORIES, TRIGGER_WARNINGS, LIMITS } = require('../constants');
const generateShareId = require('../utils/generateShareId');

const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    profession: {
        type: String,
        required: [true, 'Profession is required'],
        trim: true,
        maxlength: [LIMITS.PROFESSION_MAX, `Profession cannot exceed ${LIMITS.PROFESSION_MAX} characters`]
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: STORY_CATEGORIES,
            message: '{VALUE} is not a valid category'
        },
        index: true
    },
    text: {
        type: String,
        required: [true, 'Story text is required'],
        minlength: [LIMITS.STORY_TEXT_MIN, `Story must be at least ${LIMITS.STORY_TEXT_MIN} characters`],
        maxlength: [LIMITS.STORY_TEXT_MAX, `Story cannot exceed ${LIMITS.STORY_TEXT_MAX} characters`]
    },
    triggerWarnings: [{
        type: String,
        enum: {
            values: TRIGGER_WARNINGS,
            message: '{VALUE} is not a valid trigger warning'
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'pending',
        index: true
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
    },
    originalLanguage: {
        type: String,
        default: 'en'
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false // Don't return by default
    },
    shareId: {
        type: String,
        unique: true,
        index: true
    },
    isAnonymous: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
storySchema.index({ country: 1, category: 1 });
storySchema.index({ createdAt: -1 });

// Virtual for net votes
storySchema.virtual('netVotes').get(function () {
    return this.upvotes - this.downvotes;
});

// Virtual for vote ratio
storySchema.virtual('voteRatio').get(function () {
    const total = this.upvotes + this.downvotes;
    return total > 0 ? (this.upvotes / total) : 0;
});

// Virtual for comments count
storySchema.virtual('commentsCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'story',
    count: true
});

// Generate unique shareId before saving
storySchema.pre('save', async function (next) {
    if (!this.shareId) {
        this.shareId = generateShareId();
    }
    next();
});

module.exports = mongoose.model('Story', storySchema);
