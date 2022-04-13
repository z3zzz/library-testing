python -m zipfile -e env.zip ./
#chmod +x ./node_modules/.bin/tsc
chmod +x ./node_modules/.bin/jest
yarn test --json --outputFile=result.json
cat result.json 