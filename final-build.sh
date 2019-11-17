#!/bin/sh

ISCC="/home/miyuruasuka/.wine/drive_c/Program Files (x86)/Inno Setup 6/ISCC.exe"
export VERSION=v$(cat package.json | jq -r ".version")
rm -rf dist
# compile windoze
echo "Windows!"
npm run electron:windows
wine "$ISCC" inno/setup.iss
mv inno/Output/geph-windows-setup.exe dist/geph-windows-$VERSION-setup.exe

echo "Linux 64-bit!"
npm run electron:lin64
cd dist/linux-unpacked
tar -cvjSf ../geph-linux64-$VERSION.tar.bz2 *
cd ../../

echo "Linux 32-bit!"
npm run electron:lin32
cd dist/linux-ia32-unpacked
tar -cvjSf ../geph-linux32-$VERSION.tar.bz2 *
cd ../../ 