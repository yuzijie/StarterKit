#!/usr/bin/env bash

NPM_ROOT=$(npm run env | awk -F"=" '$1 ~ /PWD/ {print $2}')
${NPM_ROOT}/node_modules/.bin/watchify ${NPM_ROOT}/test/js/main.js -o ${NPM_ROOT}/test/gen/main.js --verbose --delay
