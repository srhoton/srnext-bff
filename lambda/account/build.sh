#!/bin/bash
set -e

echo "Building Account Lambda..."

# Clean previous builds
rm -rf dist lambda.zip

# Install dependencies
npm install

# Build TypeScript
npm run build

# Copy package.json and package-lock.json to dist
cp package.json dist/
cp package-lock.json dist/

# Install production dependencies in dist
cd dist
npm ci --only=production
cd ..

# Create lambda.zip
cd dist
zip -r ../lambda.zip .
cd ..

echo "Account Lambda build complete!"