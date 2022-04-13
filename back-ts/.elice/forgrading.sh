python -m zipfile -e env.zip ./
chmod +x ./node_modules/.bin/jest
yarn test --json --outputFile=result.json