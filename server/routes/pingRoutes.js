import express from 'express';

const router = express.Router();

// Simple ping endpoint to keep the server awake
router.get('/ping', (req, res) => {
  console.log('Ping received at:', new Date().toISOString());
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Server is awake' 
  });
});

export default router;