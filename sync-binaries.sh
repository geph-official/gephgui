#!/bin/sh
export PREFIX="https://binaries.geph.io"
export VERSION="v0.10.7-0-g06eb50c"

curl "$PREFIX/geph-client-windows-i386-$VERSION.exe" > binaries/win-ia32/geph-client.exe
curl "$PREFIX/geph-client-linux-i386-$VERSION" > binaries/lin-ia32/geph-client
chmod +x binaries/lin-ia32/geph-client
curl "$PREFIX/geph-client-linux-amd64-$VERSION" > binaries/lin-amd64/geph-client
chmod +x binaries/lin-amd64/geph-client
