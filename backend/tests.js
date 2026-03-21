const testAuth = async () => {
    console.log('Testing User Registration...');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Admin',
            email: 'admin_test@pvr.com',
            phone: '9999999999',
            password: 'password123'
        })
    });
    const regData = await regRes.json();
    console.log('Register Response:', regRes.status, regData);

    console.log('\nTesting User Login...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin_test@pvr.com',
            password: 'password123'
        })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginRes.status, loginData);

    // If login is successful, let's test a protected route
    if (loginData.token) {
        console.log('\nTesting Protected Route (Favorites)...');
        const favRes = await fetch('http://localhost:5000/api/favorites', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        const favData = await favRes.json();
        console.log('Favorites Response:', favRes.status, favData);
    }
};

testAuth().catch(console.error);
