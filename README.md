# Pellet Plant KPI Dashboard

Next.js + TypeScript replacement for the Plant 2 operational KPI dashboard.

## Development

```powershell
copy .env.example .env.local
npm.cmd install
npm.cmd run dev
```

## Production validation

```powershell
npm.cmd run build
npm.cmd start
```

Before production:
1. Set `PP_DB_ENABLED=true`.
2. Configure the SELECT-only historian account.
3. Replace `PP_ADMIN_PASSWORD` and `PP_ADMIN_SECRET`.
4. Verify `/api/health`, `/api/status`, `/api/dashboard`, and `/api/trends?metric=moisture&range=live`.
5. Confirm the server timezone does not affect operator displays; browser trend labels are explicitly rendered in Asia/Kolkata.

The application does not issue write statements against `HistorianDb`.
