const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Project = require('../models/Project');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    // We'll update the most recently created "PVR Royal Horizon" just in case there are duplicates
    const projects = await Project.find({ name: "PVR Royal Horizon" }).sort({ createdAt: -1 });
    
    if (projects && projects.length > 0) {
        const targetProject = projects[0];
        targetProject.videoId = "1BWoyQAlLvo";
        targetProject.videoUrl = "https://youtu.be/1BWoyQAlLvo?si=6wCuaooh0Q8TJxkk";
        await targetProject.save();
        console.log(`Successfully updated project ${targetProject.name} with video ID: 1BWoyQAlLvo`);
    } else {
        console.log('Project "PVR Royal Horizon" not found.');
    }
  } catch (error) {
    console.error('Error executing script:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB.');
    }
  }
}

run();
