const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Story = require('./src/models/Story');
const Comment = require('./src/models/Comment');

async function syncCommentCounts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const stories = await Story.find({});
        console.log(`📊 Processing ${stories.length} stories...`);

        for (const story of stories) {
            const count = await Comment.countDocuments({ story: story._id });
            await Story.findByIdAndUpdate(story._id, { $set: { commentCount: count } });
            console.log(`✅ Updated story ${story._id}: commentCount = ${count}`);
        }

        console.log('🚀 All stories synchronized successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error synchronizing comment counts:', error);
        process.exit(1);
    }
}

syncCommentCounts();
