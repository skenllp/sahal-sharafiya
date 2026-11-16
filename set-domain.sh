#!/bin/sh
# usage: ./set-domain.sh https://your-domain.com   (no trailing slash)
[ -z "$1" ] && { echo "usage: $0 https://your-domain.com"; exit 1; }
d="${1%/}"
sed -i.bak "s|https://YOUR-DOMAIN.vercel.app|$d|g" "$(dirname "$0")/index.html" && rm -f "$(dirname "$0")/index.html.bak"
echo "Updated index.html -> $d"
