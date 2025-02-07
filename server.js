// server.js (Node.js API)

const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect('mongodb+srv://akhilsrivastava:cPkbkbMcrcq79LEQ@clientportal.uum0f.mongodb.net/videodata', { // Replace with your MongoDB connection string
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));


// Define Schema
const videoSchema = new mongoose.Schema({
  videoUrl: String,
  isLike: Boolean,
  isComment: Boolean,
  video_watch_time: String,
  completed: { type: Boolean, default: false }, // Add a "completed" field
});

const Video = mongoose.model('autoyt', videoSchema);

app.use(cors({
    origin: '*', // Or specify the exact origin of your extension if you want to be more restrictive (see below)
}));

const allowedOrigins = [
    'chrome-extension://oenilhaakofldeifhgajinkdackmnhbl', // Replace with your actual extension ID
    // ... any other allowed origins
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) { // Allow requests with no origin (e.g., from Postman) or from allowed origins
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));

app.use(express.json());

// Seeder Function
async function seedDatabase(jsonData) {
  try {
    await Video.insertMany(jsonData);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Example usage of the seeder (you might want to call this from a separate script or route)
// Read data from JSON file
// fs.readFile('video_data.json', 'utf8', (err, data) => {
//   if (err) {
//     console.error("Error reading JSON file:", err);
//     return;
//   }
//   try {
//     const videoData = JSON.parse(data);
//     seedDatabase(videoData);
//   } catch (parseError) {
//     console.error("Error parsing JSON:", parseError);
//   }
// });


// API Endpoint to fetch and mark as completed
app.get('/api/videos', async (req, res) => {
  try {
    const video = await Video.findOneAndUpdate(
      { completed: false }, // Find a video that is not yet completed
      { $set: { completed: true } }, // Mark it as completed
      { new: true } // Return the updated document
    );

    if (!video) {
      return res.status(204).json({ message: 'No more videos to process' }); // No Content if no more videos
    }

    res.json(video);
  } catch (error) {
    console.error('Error fetching/updating video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});