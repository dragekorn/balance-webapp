#!/bin/bash
INSTANCES=5
BASE_PORT=3000

echo "Starting $INSTANCES server instances..."

for i in $(seq 1 $INSTANCES); do
  PORT=$((BASE_PORT + i - 1))
  SERVER_ID="server-$i"
  SERVER_ID=$SERVER_ID PORT=$PORT npm start &
  echo "Started server instance $i with ID $SERVER_ID on port $PORT"
  sleep 1
done

echo "All server instances started successfully!"
echo "To stop all instances, run: pkill -f 'node src/app.js'"