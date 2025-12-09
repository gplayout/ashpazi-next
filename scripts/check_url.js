const url = 'https://givukaorkjkksslrzuum.supabase.co/storage/v1/object/public/recipe-images/perfectionist/655-1765064614744.png';
const url2 = 'https://givukaorkjkksslrzuum.supabase.co/storage/v1/object/public/recipe-images/chef-audit/475-1765038008752.jpeg';

async function check(u) {
    try {
        const res = await fetch(u, { method: 'HEAD' });
        console.log(`URL: ${u}`);
        console.log(`Status: ${res.status} ${res.statusText}`);
        console.log(`Content-Type: ${res.headers.get('content-type')}`);
    } catch (e) {
        console.error(`Error fetching ${u}:`, e.message);
    }
}

async function run() {
    await check(url);
    await check(url2);
}

run();
