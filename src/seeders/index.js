const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Story, Comment, Vote, SystemSetting } = require('../models');
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
        await SystemSetting.deleteMany();

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

        // Create System Settings (Policies)
        await SystemSetting.create([
            {
                key: 'privacy_policy',
                value: `Jobcrap respects your privacy. [Default Privacy Policy Content]`,
                description: 'The platform privacy policy'
            },
            {
                key: 'terms_of_service',
                value: `Jobcrap Terms of Service. [Default Terms Content]`,
                description: 'The platform terms of service'
            },
            {
                key: 'csae_policy',
                value: `Zero Tolerance Policy\nJobCrap maintains a zero-tolerance policy for Child Sexual Abuse and Exploitation (CSAE). We prohibit any content or behavior that sexually exploits, abuses, or endangers children.\n\nWhat is CSAE?\nCSAE refers to child sexual abuse and exploitation, including content or behavior that sexually exploits, abuses, or endangers children. This includes, for example:\nGrooming a child for sexual exploitation\nSextorting a child\nTrafficking of a child for sex\nOtherwise sexually exploiting a child\nCreating, sharing, or distributing child sexual abuse material (CSAM)\nSoliciting sexual content from minors\nEngaging in sexual conversations with minors\nAny attempt to contact minors for sexual purposes... [Seeded Version]`,
                description: 'Child Sexual Abuse and Exploitation (CSAE) Policy'
            }
        ]);

        console.log('System Settings Created...');

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
        await SystemSetting.deleteMany();
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
