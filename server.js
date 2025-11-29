const express = require('express');
const app = express();
const port = 3000;

// Serve the "Pretty GUI" dashboard
app.use(express.static('public'));

// Health Check Endpoint (For the Dashboard & Bot)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// THE KILL SWITCH (To simulate crash)
app.get('/kill', (req, res) => {
  console.log('⚠️ SIMULATING CRASH...');
  res.send('Server killing...');
  process.exit(1); // Dies immediately
});

app.listen(port, () => {
  console.log(`✅ App running at http://localhost:${port}`);
});

// ...existing code...

// Add these intentional lint errors at the end of the file:

// Unused variable (lint error)

// Missing semicolon (lint error)
const x = 5;

// Console.log in production (lint warning turned error)
console.log('Debug message');

// Multiple empty lines (lint error)


// End of file

