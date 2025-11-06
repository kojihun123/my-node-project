# 새 컴퓨터에서
git clone https://github.com/kojihun123/my-node-project.git
cd fullstack-app
npm install
cd server && npm install
cd ../client && npm install
cd ../server
echo PORT=5000 > .env
echo DATABASE_URL="file:./dev.db" >> .env
npx prisma migrate dev --name init
$env:DATABASE_URL="file:./dev.db"; npx prisma generate
cd ..
npm run dev
