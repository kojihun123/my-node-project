
# 🧩 1️⃣ 새 컴퓨터에서 clone 하기

```bash
git clone https://github.com/yourname/fullstack-app.git
cd fullstack-app
```

> ✅ **Tip:**
> GitHub 주소는 `Code` 버튼 클릭 → HTTPS 주소 복사해서 붙여넣기.

---

# ⚙️ 2️⃣ 루트 폴더 구조 확인

```
fullstack-app/
├─ client/
├─ server/
└─ package.json
```

이 구조면 OK.

---

# 📦 3️⃣ 의존성(모듈) 다시 설치

각 폴더마다 `node_modules`가 없으니까 새로 깔아야 해.

```bash
# 루트 패키지 설치 (concurrently만 있음)
npm install

# 서버 패키지 설치
cd server
npm install

# 클라이언트 패키지 설치
cd ../client
npm install
```

---

# ⚙️ 4️⃣ 환경 변수 파일(.env) 다시 만들기

> `.env`는 Git에 안 올라가니까 **직접 새로 만들어야 함**
> (이거 안 하면 Prisma나 Express가 에러남)

```bash
cd ../server
echo PORT=5000 > .env
echo DATABASE_URL="file:./dev.db" >> .env
```

혹은 메모장으로 직접 작성해도 OK
(`server/.env`)

```
PORT=5000
DATABASE_URL="file:./dev.db"
```

---

# 🧱 5️⃣ Prisma 초기화

새 컴퓨터엔 DB파일(`dev.db`)이 없으니까, 마이그레이션 다시 해줘야 함 👇

```bash
cd server
npx prisma migrate dev --name init
$env:DATABASE_URL="file:./dev.db"; npx prisma generate
```

---

# 🔥 6️⃣ 실행!

이제 다시 루트로 돌아가서:

```bash
cd ..
npm run dev
```

결과 👇

* React: [http://localhost:5173](http://localhost:5173)
* Express API: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

# ✅ 7️⃣ 요약 (복붙용 메모)

```bash
# 새 컴퓨터에서
git clone https://github.com/yourname/fullstack-app.git
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
```
