#!/usr/bin/env bash
# Build an Android APK via EAS and download it as page301vX.X.X.apk
set -e

VERSION=$(node -p "require('./app.json').expo.version")
OUTFILE="page301v${VERSION}.apk"

echo "Building page301 v${VERSION} APK…"
npx eas-cli build --platform android --profile preview --non-interactive

echo "Waiting for build to finish…"
while true; do
  STATUS=$(npx eas-cli build:list --platform android --limit 1 2>/dev/null | grep "Status" | awk '{print $NF}')
  URL=$(npx eas-cli build:list --platform android --limit 1 2>/dev/null | grep "Application Archive URL" | grep -v "in progress" | awk '{print $NF}')
  echo "  Status: $STATUS"
  if [ "$STATUS" = "finished" ] && [ -n "$URL" ]; then
    break
  fi
  if [ "$STATUS" = "failed" ] || [ "$STATUS" = "errored" ] || [ "$STATUS" = "canceled" ]; then
    echo "Build $STATUS. Check https://expo.dev for details."
    exit 1
  fi
  sleep 30
done

echo "Downloading $OUTFILE…"
curl -L -o "$OUTFILE" "$URL"
echo ""
echo "✓ Ready: $OUTFILE"
echo "  Send this file to your phone or open the link:"
echo "  $URL"
