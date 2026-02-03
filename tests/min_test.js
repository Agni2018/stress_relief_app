async function test() {
    try {
        const res = await fetch('http://127.0.0.1:3000/api/auth/session');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data:', data);
    } catch (e) {
        console.error('Fetch error:', e);
    }
}
test();
