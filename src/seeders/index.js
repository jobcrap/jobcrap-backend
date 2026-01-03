const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Story, Comment, Vote } = require('../models');
const config = require('../config');

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || config.mongoUri);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Story.deleteMany();
        await Comment.deleteMany();
        await Vote.deleteMany();

        console.log('Data Cleared...');

        // Create Admin User
        const adminUser = await User.create({
            username: 'admin',
            email: config.adminEmail,
            password: 'password123',
            role: 'admin',
            authProvider: 'local'
        });

        // Create Regular Users
        const user1 = await User.create({
            username: 'johndoe',
            email: 'john@example.com',
            password: 'password123',
            role: 'user'
        });

        const user2 = await User.create({
            username: 'janedoe',
            email: 'jane@example.com',
            password: 'password123',
            role: 'user'
        });

        console.log('Users Created...');

        // Create Stories
        const stories = await Story.create([
            {
                author: user1._id,
                profession: 'Software Engineer',
                country: 'USA',
                category: 'funny',
                text: 'Spent 3 hours debugging code only to realize I was editing the wrong file. Classic.',
                upvotes: 5,
                downvotes: 0
            },
            {
                author: user2._id,
                profession: 'Nurse',
                country: 'UK',
                category: 'sad',
                text: 'Night shifts are tough when you realize you missed your child\'s school play.',
                upvotes: 12,
                downvotes: 1
            },
            {
                author: user1._id,
                profession: 'Teacher',
                country: 'Canada',
                category: 'quirky',
                text: 'My students convinced me that "yeet" is a proper verb for throwing something gracefully.',
                upvotes: 8,
                downvotes: 0
            }
        ]);

        console.log('Stories Created...');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const deleteData = async () => {
    try {
        await connectDB();
        await User.deleteMany();
        await Story.deleteMany();
        await Comment.deleteMany();
        await Vote.deleteMany();
        console.log('Data Destroyed...');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    deleteData();
} else {
    importData();
}
