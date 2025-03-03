npx tsc dropAllAndReset.ts || true
node dropAllAndReset.js

cd categories  && sh add.sh
cd ..
cd related && sh add.sh
cd ..
cd alternates && sh add.sh