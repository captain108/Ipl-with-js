const express = require('express');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = socketIo(server);

// Create or open SQLite database
const db = new sqlite3.Database('./chat.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  }
});

// Create messages table if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, username TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)');

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API to get chat history
app.get('/messages', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50', [], (err, rows) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.json(rows.reverse()); // Return messages in chronological order
  });
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send previous chat messages to the new user
  db.all('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50', [], (err, rows) => {
    if (err) {
      console.error('Error fetching messages', err);
    } else {
      socket.emit('chat history', rows.reverse()); // Send messages in chronological order
    }
  });

  // Handle incoming chat messages
  socket.on('chat message', (data) => {
    const { username, message } = data;

    // Save message in the database
    db.run('INSERT INTO messages (username, message) VALUES (?, ?)', [username, message], function (err) {
      if (err) {
        console.error('Error saving message:', err);
        return;
      }

      // Broadcast the new message to all clients
      io.emit('chat message', {
        id: this.lastID,
        username,
        message,
        timestamp: new Date().toISOString(),
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
