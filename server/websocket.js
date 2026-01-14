const WebSocket = require('ws');

let wss;
const clients = new Map();

function initializeWebSocket(server) {
  wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket connection established');
    
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Phone Backend',
      timestamp: new Date()
    }));
  });
  
  console.log('WebSocket server initialized');
}

function getConnectionStats() {
  return {
    totalConnections: wss ? wss.clients.size : 0,
    authenticatedUsers: clients.size
  };
}

module.exports = {
  initializeWebSocket,
  getConnectionStats
};