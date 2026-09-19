
const express = require('express');
const redis = require('redis');

const app = express();
const PORT = 8081;

// Create Redis client
const client = redis.createClient({
    url: 'redis://redis-service:6379'
    //host:'redis-service',
    //port: 6397
});

// Handle Redis errors
client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Start application
async function start() {
    try {
        // Connect to Redis FIRST
        await client.connect();

        console.log('Connected to Redis');

        // Initialize visits if it doesn't exist
        if (!(await client.exists('visits'))) {
            await client.set('visits', 0);
        }

        // HTTP endpoint
        app.get('/', async (req, res) => {
            try {
                // Get current number of visits
                const visits = await client.get('visits');

                // Return current number
                res.send('Number of visitor is ' + visits);

                // Increment for next visit
                await client.set('visits', parseInt(visits) + 1);

            } catch (error) {
                console.error('Redis operation error:', error);
                res.status(500).send('Redis error');
            }
        });

        // Start Express
        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}

start();
