
const fs = require('fs');

async function testTTS() {
    console.log("🎤 Testing TTS API...");

    try {
        const response = await fetch('http://localhost:3000/api/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Hello Chef, how are you?",
                language: "en"
            })
        });

        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        console.log("✅ API Response Received");
        console.log(`   Text: "${data.text}"`);

        if (data.audio) {
            console.log(`   Audio Size: ${data.audio.length} chars`);
            const buffer = Buffer.from(data.audio, 'base64');
            fs.writeFileSync('test_output.mp3', buffer);
            console.log("   💾 Saved to test_output.mp3");
        } else {
            console.error("   ❌ No audio field in response!");
        }

    } catch (e) {
        console.error("❌ Request Failed:", e.message);
    }
}

testTTS();
