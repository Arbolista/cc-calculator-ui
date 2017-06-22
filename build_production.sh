rm -rf ./build
mkdir -p ./build/production/assets/font-awesome
cp -rf ./server/assets/* ./build/production/assets/
cp -rf ./node_modules/font-awesome/ ./build/production/assets/
mv ./build/production/assets/favicon.ico ./build/production/favicon.ico
npm run build_production
cp -f ./server/views/index.ejs ./build/production/index.html
sed -i '32,33d' ./build/production/index.html
