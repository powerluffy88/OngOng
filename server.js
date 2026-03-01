const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store all connected clients
const clients = new Set();

// Handle new WebSocket connections
wss.on('connection', (ws) => {
  console.log('New player connected');
  clients.add(ws);

  // Notify all players that someone joined
  const joinMessage = {
    type: 'system',
    text: 'A new player joined the game!',
    timestamp: new Date().toISOString()
  };
  broadcast(JSON.stringify(joinMessage));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      message.timestamp = new Date().toISOString();
      
      // Broadcast message to all connected players
      broadcast(JSON.stringify(message));
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Player disconnected');
    clients.delete(ws);
    
    const leaveMessage = {
      type: 'system',
      text: 'A player left the game!',
      timestamp: new Date().toISOString()
    };
    broadcast(JSON.stringify(leaveMessage));
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast function to send messages to all connected clients
function broadcast(data) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Serve static files
app.use(express.static('public'));

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready for connections`);
});