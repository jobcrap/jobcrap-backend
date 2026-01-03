const fetch = require('node-fetch'); // Assuming node-fetch is available or using native fetch in Node 18+

const BASE_URL = 'http://localhost:5000/api';

async function run() {
    try {
        const timestamp = Date.now();
        const userData = {
            username: `tester_${timestamp}`,
            email: `tester_${timestamp}@example.com`,
            password: 'password123'
        };

        // 1. Register
        console.log('Registering user...');
        let res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        let data = await res.json();
        if (!res.ok) {
            // If register fails, try login (maybe seeded)
            console.log('Register failed, trying login...');
            res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData.email, password: userData.password })
            });
            data = await res.json();
            if (!res.ok) throw new Error('Auth failed: ' + JSON.stringify(data));
        }

        const token = data.token;
        console.log('Logged in.');

        // 2. Create Story
        console.log('Creating story...');
        res = await fetch(`${BASE_URL}/stories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                profession: 'Tester',
                country: 'TestLand',
                category: 'Work',
                text: 'This is a test story for comments.'
            })
        });
        data = await res.json();
        if (!res.ok) throw new Error('Create story failed: ' + JSON.stringify(data));
        const storyId = data.data._id || data._id; // Adjust based on response structure
        console.log('Story created:', storyId);

        // 3. Add Comments
        console.log('Adding comments...');
        // Comment 1
        res = await fetch(`${BASE_URL}/stories/${storyId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: 'Comment A' })
        });
        let c1 = await res.json();
        const c1Id = c1.data?._id || c1._id;

        // Comment 2
        res = await fetch(`${BASE_URL}/stories/${storyId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: 'Comment B' })
        });
        let c2 = await res.json();
        const c2Id = c2.data?._id || c2._id;

        console.log('Comments added:', c1Id, c2Id);

        // 4. Vote on Comment A (Upvote)
        console.log('Upvoting Comment A...');
        res = await fetch(`${BASE_URL}/comments/${c1Id}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ voteType: 'upvote' })
        });
        data = await res.json();
        console.log('Vote result A:', JSON.stringify(data));

        // 5. Vote on Comment B (Downvote)
        console.log('Downvoting Comment B...');
        res = await fetch(`${BASE_URL}/comments/${c2Id}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ voteType: 'downvote' })
        });
        data = await res.json();
        console.log('Vote result B:', JSON.stringify(data));

        // 6. Get Comments and check order
        console.log('Fetching comments to check sort order...');
        res = await fetch(`${BASE_URL}/stories/${storyId}/comments`, {
            method: 'GET'
        });
        data = await res.json();
        const comments = data.data?.comments || data.comments || [];

        console.log('Comments retrieved:', comments.length);
        comments.forEach((c, i) => {
            console.log(`${i}: ${c.text} (Up: ${c.upvotes}, Down: ${c.downvotes})`);
        });

        if (comments[0]._id === c1Id) {
            console.log('SUCCESS: Comment A is first (Higher score).');
        } else {
            console.log('FAILURE: Sort order incorrect.');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
