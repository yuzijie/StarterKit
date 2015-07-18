#!/usr/bin/env bash

NPM_ROOT=$(npm run env | awk -F"=" '$1 ~ /PWD/ {print $2}')
sass --watch ${NPM_ROOT}/test/sass:${NPM_ROOT}/test/gen
