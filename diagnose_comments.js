const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Story = require('./src/models/Story');
const Comment = require('./src/models/Comment');

async function diagnoseCommentCounts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const stories = await Story.find({});
        console.log(`📊 Checking ${stories.length} stories...`);

        let discrepancies = 0;
        for (const story of stories) {
            const actualCount = await Comment.countDocuments({ story: story._id });
            const storedCount = story.commentCount || 0;

            if (actualCount !== storedCount) {
                console.log(`❌ Discrepancy found in story ${story._id}: Stored=${storedCount}, Actual=${actualCount}`);
                discrepancies++;
            }
        }

        if (discrepancies === 0) {
            console.log('✅ All comment counts are perfectly synchronized.');
        } else {
            console.log(`⚠️ Found ${discrepancies} stories with incorrect comment counts.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error diagnosing comment counts:', error);
        process.exit(1);
    }
}

diagnoseCommentCounts();
