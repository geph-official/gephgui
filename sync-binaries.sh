#!/bin/sh
export PREFIX="https://binaries.geph.io"
export VERSION="v0.10.1-1-g22fcc70"

curl "$PREFIX/geph-client-windows-i386-$VERSION.exe" > binaries/win-ia32/geph-client.exe
curl "$PREFIX/geph-client-linux-i386-$VERSION" > binaries/lin-ia32/geph-client
chmod +x binaries/lin-ia32/geph-client
curl "$PREFIX/geph-client-linux-amd64-$VERSION" > binaries/lin-amd64/geph-client
chmod +x binaries/lin-amd64/geph-client