const testSiteVisits = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/site-visit/book', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: 'Test', email: 'test@example.com', phone: '1234567890', preferredDate: '2027-01-01', message: 'Hi', projectId: null })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        try {
            console.log(JSON.parse(text));
        } catch (e) {
            console.log("Response text:", text);
        }
    } catch (e) {
        console.error("Fetch threw:", e);
    }
};

testSiteVisits();
