#!/bin/bash
cd /app/frontend
export CI=false
yarn expo start --tunnel --port 3000