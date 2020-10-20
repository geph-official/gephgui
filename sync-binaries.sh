#!/bin/sh
export PREFIX="https://f001.backblazeb2.com/file/geph-dl/geph4-binaries"
#https://54-295245253-gh.circle-artifacts.com/0/%7E/repo/OUTPUT/geph4-client-windows-amd64.exe
#export VERSION="v0.22.3"

curl -L "$PREFIX/geph4-client-windows-amd64.exe" > binaries/win-ia32/geph4-client.exe
#curl "$PREFIX/geph-client-linux-i386-$VERSION" > binaries/linux-ia32/geph-client
#chmod +x binaries/linux-ia32/geph-client
curl -L "$PREFIX/geph4-client-linux-amd64" > binaries/linux-x64/geph4-client
chmod +x binaries/linux-x64/geph4-client
curl -L "$PREFIX/geph4-client-macos-amd64" > binaries/mac-x64/geph4-client
chmod +x binaries/mac-x64/geph4-client
