# How to Upload / Deploy Didostati

Your project has **three parts** that can live in different places:

| Part        | What it is              | Where it can run                    |
|------------|--------------------------|-------------------------------------|
| **Database** | MongoDB                  | MongoDB Atlas (cloud, free tier)    |
| **Backend**  | Node/Express API (port 5000) | Render, Railway, Fly.io, or a VPS |
| **Frontend** | Next.js app (port 3000)  | Vercel (best for Next.js) or same VPS |

You **do not** have to put backend and frontend on the same server. Most people use:
- **Database**: MongoDB Atlas  
- **Backend**: one hosting (e.g. Render or Railway)  
- **Frontend**: another (e.g. Vercel)

---

## Option 1: Deploy each part separately (recommended)

### Step 1: Database – MongoDB Atlas (free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create an account.
2. Create a **free** cluster (e.g. M0).
3. In **Database Access** → Add user (username + password). Remember the password.
4. In **Network Access** → Add IP: `0.0.0.0/0` (allow from anywhere; you can restrict later).
5. In the cluster → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```text
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/didostati?retryWrites=true&w=majority
   ```
   Replace `USERNAME`, `PASSWORD`, and if you want a different DB name replace `didostati`.

You will use this as `MONGODB_URI` for the backend.

---

### Step 2: Backend – e.g. Render (free tier)

1. Push your code to **GitHub** (you already have the repo).
2. Go to [render.com](https://render.com) → Sign up (GitHub login is fine).
3. **New** → **Web Service**.
4. Connect your GitHub repo **Didostati**.
5. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid if you prefer)
6. **Environment** (Environment Variables). Add:

   | Key           | Value |
   |---------------|--------|
   | `NODE_ENV`    | `production` |
   | `PORT`        | `5000` (or leave empty; Render sets it) |
   | `MONGODB_URI` | Your Atlas connection string from Step 1 |
   | `FRONTEND_URL`| Your frontend URL **after** you deploy it (e.g. `https://your-app.vercel.app`) |
   | `JWT_SECRET`  | A long random string (e.g. generate one at [randomkeygen.com](https://randomkeygen.com)) |
   | `JWT_EXPIRE`  | `7d` |

7. Deploy. When it’s done, Render gives you a URL like:  
   `https://didostati-backend.onrender.com`  
   Your **API base URL** is: `https://didostati-backend.onrender.com/api`  
   (You will use this for the frontend.)

**Note:** On free tiers the filesystem is not permanent. Files in `uploads/` can be lost on redeploy. For real file storage later use something like AWS S3 or Cloudinary.

---

### Step 3: Frontend – Vercel (free, good for Next.js)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub.
2. **Add New** → **Project** → Import your **Didostati** repo.
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: leave default
4. **Environment Variables**. Add:

   | Key                        | Value |
   |----------------------------|--------|
   | `NEXT_PUBLIC_API_URL`      | Your backend API URL, e.g. `https://didostati-backend.onrender.com/api` |
   | `NEXT_PUBLIC_DELIVERY_BASE_LAT`  | (same as in your `.env.local`, e.g. `41.9842`) |
   | `NEXT_PUBLIC_DELIVERY_BASE_LNG`  | (e.g. `44.1158`) |
   | `NEXT_PUBLIC_DELIVERY_BASE_LABEL`| (e.g. `გორი`) |

5. Deploy. Vercel will give you a URL like:  
   `https://didostati.vercel.app`

---

### Step 4: Connect backend and frontend

1. In **Render** (backend):  
   Set `FRONTEND_URL` to your Vercel URL, e.g. `https://didostati.vercel.app`  
   (Backend uses this for CORS so the browser allows requests from your frontend.)
2. Redeploy the backend on Render so it picks up the new env.
3. Open your Vercel URL in the browser. The frontend will call the backend using `NEXT_PUBLIC_API_URL`.

---

## Option 2: Backend on Railway instead of Render

1. [railway.app](https://railway.app) → Login with GitHub.
2. **New Project** → **Deploy from GitHub** → choose Didostati.
3. Add a **service** for the backend:
   - **Root Directory**: `backend`
   - **Build**: `npm install`
   - **Start**: `npm start`
4. In **Variables** add the same keys as in Step 2 above (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, etc.).
5. Railway assigns a public URL; use that as your API URL (e.g. `https://xxx.railway.app/api`) in the frontend’s `NEXT_PUBLIC_API_URL`.

---

## Do you have to upload backend and frontend to different places?

**No.** You can:

- Put **backend and frontend on the same VPS** (e.g. DigitalOcean, Linode): install Node, run backend on one port, build Next.js and serve it (or with nginx). More setup, one server to manage.
- Or keep the **split** (Atlas + Render/Railway + Vercel): no server to maintain, free tiers, and each part scales independently.

For learning and small projects, **Option 1 (Atlas + Render + Vercel)** is usually the simplest.

---

## Checklist before going live

- [ ] MongoDB Atlas cluster created and `MONGODB_URI` in backend env.
- [ ] Backend deployed (Render or Railway); health check works:  
  `https://YOUR_BACKEND_URL/api/health`
- [ ] Frontend deployed (Vercel); `NEXT_PUBLIC_API_URL` points to backend `/api` URL.
- [ ] Backend `FRONTEND_URL` set to your real frontend URL (for CORS).
- [ ] `JWT_SECRET` is a long, random string only you know.
- [ ] (Optional) Run backend seed once against production DB if you need initial data:  
  set `MONGODB_URI` locally to Atlas URI and run `npm run seed` from `backend/`.

---

## Summary

| What        | Where to upload        | Result |
|------------|------------------------|--------|
| Database   | MongoDB Atlas          | Connection string → `MONGODB_URI` |
| Backend    | Render or Railway      | API URL → use in frontend as `NEXT_PUBLIC_API_URL` |
| Frontend   | Vercel                 | Site URL → use in backend as `FRONTEND_URL` |

You **do not** have to upload backend and frontend to the same place; using Atlas + one backend host + Vercel is a common and good setup.
