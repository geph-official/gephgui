#!/bin/sh
export PREFIX="https://f001.backblazeb2.com/file/geph-dl/geph4-binaries"
#https://54-295245253-gh.circle-artifacts.com/0/%7E/repo/OUTPUT/geph4-client-windows-amd64.exe
#export VERSION="v0.22.3"

curl -v -L "$PREFIX/geph4-client-windows-i386.exe" > binaries/win-ia32/geph4-client.exe
curl -L "$PREFIX/geph4-client-windows-amd64.exe" > binaries/win-ia32/geph4-client64.exe
#curl "$PREFIX/geph-client-linux-i386-$VERSION" > binaries/linux-ia32/geph-client
#chmod +x binaries/linux-ia32/geph-client
curl -L "$PREFIX/geph4-client-linux-amd64" > binaries/linux-x64/geph4-client
chmod +x binaries/linux-x64/geph4-client
curl -L "$PREFIX/geph4-vpn-helper-linux-amd64" > binaries/linux-x64/geph4-vpn-helper
chmod +x binaries/linux-x64/geph4-vpn-helper
curl -L "$PREFIX/geph4-client-macos-amd64" > binaries/mac-x64/geph4-client
chmod +x binaries/mac-x64/geph4-client
exit 0

echo "building socks2http from source"
rm -rf socks2http
git clone https://github.com/zenhack/socks2http
cd socks2http
GOOS=windows GOARCH=386 CGO_ENABLED=0 go build -v -trimpath
mv socks2http.exe ../binaries/win-ia32/socks2http.exe
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -v -trimpath
mv socks2http ../binaries/linux-x64/socks2http
GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -v -trimpath 
mv socks2http ../binaries/mac-x64/socks2http
cd ..
rm -rf socks2http
