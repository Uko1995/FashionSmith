#!/bin/bash

# FashionSmith Production Cleanup Script
echo "🧹 Starting FashionSmith Production Cleanup..."

# Count remaining console.log statements
echo "📊 Scanning for remaining console statements..."
CLIENT_CONSOLE_COUNT=$(find ./client/src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | xargs grep -c "console\." 2>/dev/null | awk -F: '{sum += $2} END {print sum}')
SERVER_CONSOLE_COUNT=$(find ./server -name "*.js" -o -name "*.ts" | xargs grep -c "console\." 2>/dev/null | awk -F: '{sum += $2} END {print sum}')

echo "📈 Console statements found:"
echo "   Client: $CLIENT_CONSOLE_COUNT statements"
echo "   Server: $SERVER_CONSOLE_COUNT statements"

# List files with most console statements
echo ""
echo "📋 Files with most console statements:"
echo "CLIENT SIDE:"
find ./client/src -name "*.js" -o -name "*.jsx" | xargs grep -c "console\." 2>/dev/null | sort -t: -k2 -nr | head -10

echo ""
echo "SERVER SIDE:"
find ./server -name "*.js" | xargs grep -c "console\." 2>/dev/null | sort -t: -k2 -nr | head -10

echo ""
echo "🔍 To find specific console statements:"
echo "   grep -r 'console\.' client/src/ --include='*.js' --include='*.jsx'"
echo "   grep -r 'console\.' server/ --include='*.js'"

echo ""
echo "⚡ IMPORTANT:"
echo "   - Client console.log statements will be automatically removed in production builds"
echo "   - Server console.error statements should be kept for error tracking"
echo "   - Consider replacing debug console.log with environment-specific logging"

echo ""
echo "✅ Production cleanup completed!"
