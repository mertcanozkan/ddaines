# Environment Setup Guide

## Step 1 — Copy the example file

```bash
cp .env.example .env.local
```

---

## Step 2 — `DATABASE_URL` — Neon PostgreSQL

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project (any name, e.g. `daines-gallery`)
3. From the dashboard, click **Connection Details**
4. Select **Connection string** and copy the full URL
5. Paste it as `DATABASE_URL`

**Example:**
```
DATABASE_URL=postgresql://alex:pass@ep-cool-fox-123.us-east-2.aws.neon.tech/neondb?sslmode=require
```

After filling this in, push the schema to your database:
```bash
npx dotenv -e .env.local -- npx drizzle-kit push
```

---

## Step 3 — `AUTH_SECRET` + `AUTH_URL` — NextAuth

Generate a secure random secret:
```bash
openssl rand -base64 32
```

Paste the output as `AUTH_SECRET`. It must be at least 32 characters.

Set `AUTH_URL` to:
- `http://localhost:3000` for local development
- Your production domain when deploying (e.g. `https://dainesgallery.com`)

---

## Step 4 — `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` — Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Set Application type to **Web application**
6. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy **Client ID** → `AUTH_GOOGLE_ID`
8. Copy **Client Secret** → `AUTH_GOOGLE_SECRET`

> **Optional:** If you don't need Google login, leave these blank — email/password login will still work.

---

## Step 5 — `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` — Image Storage

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. Open the **Dashboard** — all three values are visible immediately:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

---

## Step 6 — `RESEND_API_KEY` + `EMAIL_FROM` — Email (Password Reset)

> **Optional for local development.** The app logs the reset token to the console if no email provider is configured.

1. Go to [resend.com](https://resend.com) and create a free account
2. Navigate to **API Keys → Create API Key**
3. Copy the key → `RESEND_API_KEY`
4. Set `EMAIL_FROM` to a verified sender address (e.g. `noreply@yourdomain.com`)

To use a custom domain, add the DNS records shown in Resend's dashboard. For quick testing you can use `onboarding@resend.dev`, which is limited to sending to your own account's email address.

---

## Complete `.env.local` example

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://alex:pass@ep-cool-fox-123.us-east-2.aws.neon.tech/neondb?sslmode=require

# NextAuth
AUTH_SECRET=your-openssl-generated-32-char-string
AUTH_URL=http://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=123456789-abc.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxx

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

---

## Final steps

Once all values are filled in:

```bash
# Push the database schema
npx dotenv -e .env.local -- npx drizzle-kit push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.
