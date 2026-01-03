const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { USER_ROLES, AUTH_PROVIDERS } = require('../constants');
const config = require('../config');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true, // Only for firebase users
        index: true
    },
    avatar: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    },
    password: {
        type: String,
        required: function () {
            // Password is only required if auth provider is LOCAL and it's NOT a firebase user
            return this.authProvider === AUTH_PROVIDERS.LOCAL && !this.firebaseUid;
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values
        trim: true
    },
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.USER
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    authProvider: {
        type: String,
        enum: Object.values(AUTH_PROVIDERS),
        default: AUTH_PROVIDERS.LOCAL
    },
    providerId: {
        type: String,
        sparse: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpire }
    );
};

module.exports = mongoose.model('User', userSchema);
