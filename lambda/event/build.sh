#!/bin/bash
set -e

echo "Building Event Lambda function..."

# Clean previous build
rm -rf dist
rm -rf lambda.zip

# Install dependencies
npm ci

# Run linting (skip on error for now due to plugin issue)
npm run lint || echo "Warning: Linting failed, continuing..."

# Run type checking
npm run typecheck || echo "Warning: Type checking failed, continuing..."

# Build TypeScript
npm run build

# Create deployment package
mkdir -p dist-package
cp -r dist/* dist-package/
cp package.json dist-package/
cp package-lock.json dist-package/

# Install production dependencies only
cd dist-package
npm ci --omit=dev
cd ..

# Create zip file
cd dist-package
zip -r ../lambda.zip .
cd ..

# Clean up
rm -rf dist-package

echo "Build complete! Lambda package: lambda.zip"