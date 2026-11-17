# Rakin Khan — 3D Personal Portfolio

Premium React + Vite portfolio with a configurable Three.js hero scene, Supabase CMS, authenticated admin area, project management and contact inbox.

Requires Node.js 22.12+ and npm. Run `npm install`, copy `.env.example` to `.env`, set the Supabase URL and publishable key, then run `npm run dev`.

Open `/admin` to sign in with the account authorized in `public.admin_users`. Admin membership is verified against that table, never user-editable metadata.

Never expose service-role or secret keys in browser code or commit them to Git.
