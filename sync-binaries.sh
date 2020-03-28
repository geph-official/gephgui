#!/bin/sh
export PREFIX="https://binaries.geph.io"
export VERSION="v0.19.6"

curl "$PREFIX/geph-client-windows-i386-$VERSION.exe" > binaries/win-ia32/geph-client.exe
curl "$PREFIX/geph-client-linux-i386-$VERSION" > binaries/linux-ia32/geph-client
chmod +x binaries/linux-ia32/geph-client
curl "$PREFIX/geph-client-linux-amd64-$VERSION" > binaries/linux-x64/geph-client
chmod +x binaries/linux-x64/geph-client
curl "$PREFIX/geph-client-macos-amd64-$VERSION" > binaries/mac-x64/geph-client
chmod +x binaries/mac-x64/geph-client
