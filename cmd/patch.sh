#!/usr/bin/env bash

echo "your commit message:"
read message

if [ ! -z "$message" ]; then
    git add --all :/
    git commit -m "$message"

    NPM_ROOT=$(npm run env | awk -F"=" '$1 ~ /PWD/ {print $2}')
    cd "$NPM_ROOT"
    npm version patch -m "$message"
    npm publish
    git push && git push github
else
    echo "no message"
fi
