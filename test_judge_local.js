const fs = require('fs');

async function testJudge() {
    console.log("Testing /api/judge locally...");

    // Minimal 1x1 JPEG base64 (Red Dot)
    const dummyImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

    try {
        const res = await fetch('http://localhost:3000/api/judge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: dummyImage,
                language: 'en'
            })
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Raw Response:", text);

        if (res.ok) {
            const json = JSON.parse(text);
            console.log("Parsed JSON:", JSON.stringify(json, null, 2));
        }

    } catch (e) {
        console.error("Test Failed:", e);
    }
}

testJudge();
