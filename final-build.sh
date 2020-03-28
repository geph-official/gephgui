#!/bin/sh

ISCC="/home/miyuruasuka/.wine/drive_c/Program Files (x86)/Inno Setup 6/ISCC.exe"
export VERSION=$(cat package.json | jq -r ".version")
rm -rf dist
npm run electron:allplat
# compile windoze
echo "Windows!"
wine "$ISCC" inno/setup.iss
mv inno/Output/geph-windows-setup.exe dist/geph-windows-$VERSION-setup.exe

echo "Linux 64-bit!"
#npm run electron:lin64
cd dist/linux-unpacked
echo "#!/bin/sh" >> RUN-ME.sh
echo "./gephgui --no-sandbox &" >> RUN-ME.sh
chmod +x RUN-ME.sh
tar -cvjSf ../geph-linux64-$VERSION.tar.xz *
cd ../../

echo "Linux 32-bit!"
#npm run electron:lin32
cd dist/linux-ia32-unpacked
echo "#!/bin/sh" >> RUN-ME.sh
echo "./gephgui --no-sandbox &" >> RUN-ME.sh
chmod +x RUN-ME.sh
tar -cvjSf ../geph-linux32-$VERSION.tar.xz *
cd ../../ 

echo "MacOS 64-bit!"
#npm run electron:macos
echo "*** FINISH ON A MAC BY RUNNING macos/makedmg **"
