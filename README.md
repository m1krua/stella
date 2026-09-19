# React + Vite

Frontend for translation company Stella. Built with React, Vite, React Router, Supabase Auth and Supabase Database.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Supabase setup

Copy `.env.example` to `.env.local` and set only the public browser variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never put a Supabase `service_role` key in the frontend or commit it to the repository. In the Supabase Dashboard open **SQL Editor**, paste and run the complete `supabase-schema.sql`. It creates the profile trigger, role column, relationships, `orders`, `order_files`, the private `order-files` Storage bucket and Row Level Security policies.

After running it, verify in **Table Editor** that `orders` and `order_files` exist and in **Storage** that the private `order-files` bucket exists. The frontend cannot create tables or policies with the publishable key. If the browser shows `PGRST205: Could not find the table 'public.orders'`, the SQL has not been applied to this Supabase project yet.

When these variables are absent, the app shows an explicit local demo mode. Demo mode is for UI development only and is not secure authentication.

## Roles

- `client`: creates and views their own orders.
- `translator`: maintains a professional profile and works with assigned orders.
- `admin`: manages orders, users, translators, applications, services and settings.

Public registration can create only `client` or `translator`. Admin accounts are never created through the public form.

## Create the first admin

1. Create a normal account through `/register` using the customer's email.
2. Apply `supabase-admin-seed.sql` in Supabase SQL Editor after replacing `CLIENT_ADMIN_EMAIL@example.com` with the customer's email. Keep the placeholder out of production data and source control.
3. Verify that the profile has `role = 'admin'`.
4. Sign in through `/login` and open `/admin`.

The developer must not give the customer a developer password or a `service_role` key. The customer should set their own password. After handoff, delete the test account or change it to a regular role.

## Route protection

`ProtectedRoute` redirects unauthenticated users to `/login` and redirects authenticated users to the dashboard matching their profile role. Client, translator and admin branches are checked independently. Supabase RLS remains the actual data protection boundary; frontend guards are only a UX boundary.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
