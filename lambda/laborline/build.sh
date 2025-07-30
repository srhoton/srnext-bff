#!/bin/bash

set -e

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Creating deployment package..."
cp -r node_modules dist/
cd dist
zip -r ../lambda.zip . -x "*.test.js" "*.test.js.map"
cd ..

echo "Lambda package created: lambda.zip"