// tests/api_verification.js
const BASE_URL = 'http://127.0.0.1:3000';
const testData = {
    email: `testuser_${Date.now()}@example.com`,
    password: 'Password123!',
    username: 'TestHero'
};

let cookie = '';

async function runTest(name, fn) {
    console.log(`\n[TEST] ${name}`);
    try {
        await fn();
        console.log(`[PASS] ${name}`);
        await new Promise(r => setTimeout(r, 500)); // Small delay
    } catch (error) {
        console.error(`[FAIL] ${name}`);
        console.error(error.stack || error);
        process.exit(1);
    }
}

async function startTests() {
    console.log('Starting MindEase API Verification...\n');

    // 1. Signup
    await runTest('User Signup', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testData.email, password: testData.password })
        });
        const data = await res.json();
        if (res.status !== 201) throw new Error(data.message || 'Signup failed');
        console.log('Signup Result:', JSON.stringify(data, null, 2));
    });

    // 2. Login
    await runTest('User Login', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testData.email, password: testData.password })
        });
        const data = await res.json();
        if (res.status !== 200) throw new Error(data.message || 'Login failed');

        // Extract cookie
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            cookie = setCookie.split(';')[0];
            console.log('Auth Cookie obtained.');
        } else {
            throw new Error('No cookie returned from login');
        }
        console.log('Login Result:', JSON.stringify(data, null, 2));
    });

    // 3. Set Username
    await runTest('Set Username', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/set-username`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify({ username: testData.username })
        });
        const data = await res.json();
        if (res.status !== 200) throw new Error(data.message || 'Set username failed');

        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            cookie = setCookie.split(';')[0];
            console.log('Auth Cookie updated.');
        }

        console.log('Set Username Result:', JSON.stringify(data, null, 2));
    });

    // 4. Check Session
    await runTest('Check Session', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/session`, {
            headers: { 'Cookie': cookie }
        });
        const data = await res.json();
        if (!data.loggedIn || data.user.username !== testData.username) {
            throw new Error('Session check failed or username mismatch');
        }
        console.log('Session Check Result:', JSON.stringify(data, null, 2));
    });

    // 5. Save Mood
    await runTest('Save Mood Entry', async () => {
        const moodData = { mood: 'Happy', note: 'Feeling great after tests!' };
        const res = await fetch(`${BASE_URL}/api/mood/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify(moodData)
        });
        const data = await res.json();
        if (res.status !== 200) throw new Error(data.message || 'Save mood failed');
        console.log('Save Mood Result:', JSON.stringify(data, null, 2));
    });

    // 6. Get Moods
    await runTest('Get Mood Entries', async () => {
        const res = await fetch(`${BASE_URL}/api/mood/get`, {
            headers: { 'Cookie': cookie }
        });
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Failed to retrieve mood entries');
        console.log('Retrieve Moods Result: Found', data.length, 'entries');
    });

    // 7. Save Game Score
    await runTest('Save Game Score', async () => {
        const scoreData = { gameName: 'memory', score: 100 };
        const res = await fetch(`${BASE_URL}/api/games/save-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify(scoreData)
        });
        const data = await res.json();
        if (res.status !== 200) throw new Error(data.message || 'Save score failed');
        console.log('Save Score Result:', JSON.stringify(data, null, 2));
    });

    // 8. Get Game Scores
    await runTest('Get Game Scores', async () => {
        const res = await fetch(`${BASE_URL}/api/games/get-scores`, {
            headers: { 'Cookie': cookie }
        });
        const data = await res.json();
        if (data.memory !== 100) throw new Error('Game score mismatch');
        console.log('Retrieve Scores Result:', JSON.stringify(data, null, 2));
    });

    console.log('\nAll tests completed successfully! ✅');
}

startTests();
