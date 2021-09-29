#!/bin/bash

set -e

export VERSION=$(cat package.json | jq -r ".version")
echo "Linux 64-bit!"
CI= npm run electron:lin64
cd dist/linux-unpacked
echo "#!/bin/sh" >> RUN-ME.sh
echo "./gephgui4 --no-sandbox &" >> RUN-ME.sh
chmod +x RUN-ME.sh
tar -cvO * | xz -T 2 > ../geph-linux64-$VERSION.tar.xz
pwd
ls
cd ../../
pwd
ls