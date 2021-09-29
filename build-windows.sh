#!/bin/bash

wget https://cloudflare-ipfs.com/ipfs/QmR8dQpon36ACS3dqsKUQLQv2vng93SnqzX18uvksKEEEe
unzip QmR8dQpon36ACS3dqsKUQLQv2vng93SnqzX18uvksKEEEe
export VERSION=$(cat package.json | jq -r ".version")
echo "Windows 32-bit!"
CI= npm run electron:windows
wine ISCC.exe inno/setup.iss
mv inno/Output/geph-windows-setup.exe dist/geph-windows-$VERSION-setup.exe
