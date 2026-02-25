require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');

const coords = [
    { name: 'PVR Grand Heights', lat: 16.5062, lng: 80.6480 },
    { name: 'PVR Emerald Villas', lat: 16.5310, lng: 80.5270 },
    { name: 'PVR Business Tower', lat: 16.4890, lng: 80.6820 },
    { name: 'Raintree Park Residency', lat: 16.4933, lng: 80.6215 },
    { name: 'PVR Royal Enclave', lat: 16.5175, lng: 80.6235 },
    { name: 'PVR Silicon Valley', lat: 16.4307, lng: 80.5525 },
    { name: 'PVR Lakeside Retreat', lat: 16.5810, lng: 80.6015 },
    { name: 'PVR Golden Square', lat: 16.5150, lng: 80.6340 },
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    for (const c of coords) {
        await Project.updateOne({ name: c.name }, { $set: { coordinates: { lat: c.lat, lng: c.lng } } });
        console.log('Updated:', c.name);
    }
    console.log('Done');
    await mongoose.disconnect();
    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
