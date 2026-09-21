# Deploying NEERKAVAL

NEERKAVAL has two pieces. A static host such as GitHub Pages can serve the
frontend but **cannot run the backend**, so the API must be hosted separately.

```
Browser ──> GitHub Pages (React frontend, static)
                 │
                 └── HTTPS ──> Render / Railway / Fly.io (FastAPI backend)
                                        │
                                        └──> Open-Meteo weather API
```

Without a backend URL the frontend still builds and loads, but it shows an
explicit "backend not connected" notice. It never shows blank or invented
values in place of real data.

---

## Step 1 — Deploy the backend

### Render (blueprint included)

1. Push this repository to GitHub.
2. On [render.com](https://render.com), choose **New → Blueprint** and select the repo.
   `render.yaml` at the repo root configures everything.
3. After the first deploy, set the `CORS_ORIGINS` env var to your frontend origin,
   e.g. `https://mahendrans8098-netizen.github.io`.
4. Confirm `https://<your-service>.onrender.com/health` returns `{"status":"healthy"}`.

Note: the free plan sleeps after inactivity, so the first request after idling
takes ~30 seconds. SQLite on the free plan resets on restart — attach a managed
Postgres and set `DATABASE_URL` if you need data to persist.

### Railway / Fly.io / any Docker host

`backend/Dockerfile` and `backend/Procfile` are both present. Set the same env vars:

| Variable       | Value                                             |
| -------------- | ------------------------------------------------- |
| `JWT_SECRET`   | a long random string                              |
| `CORS_ORIGINS` | your frontend origin, comma-separated for several  |
| `DATABASE_URL` | `sqlite:///./neerkaval.db` or a Postgres URL       |
| `APP_MODE`     | `LIVE`                                            |

Generate a secret with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

---

## Step 2 — Deploy the frontend to GitHub Pages

1. In the repo: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
2. In **Settings → Secrets and variables → Actions → Variables**, add:
   - Name: `VITE_API_BASE_URL`
   - Value: your backend URL from step 1, e.g. `https://neerkaval-api.onrender.com`
3. Push to `main`. The `.github/workflows/pages.yml` workflow builds
   `frontend/` and publishes it at the site root.

The site is then live at `https://<user>.github.io/<repo>/`.

### If the root URL returns 404

That means `index.html` is not at the published root — usually because a
pre-built `dist` folder was committed into a subdirectory instead of being
built by the workflow. Use the workflow above rather than committing `dist`.

---

## Step 3 — Verify

Open the site and check, in order:

- [ ] Page loads with the Tamil interface, no "backend not connected" banner
- [ ] Weather card shows a real temperature and a `நேரடி தரவு` (LIVE) badge
- [ ] Risk factors under "ஏன் அபாயம்?" are populated
- [ ] Officer login at `#/officer/login` succeeds with `officer` / `neerkaval123`
- [ ] Submitting an SOS returns a pending, **unacknowledged** status

If the weather card shows `தகவல் கிடைக்கவில்லை` (UNAVAILABLE), open the browser
console. A CORS error means `CORS_ORIGINS` on the backend does not include your
frontend origin.

---

## Security before any public demo

- Change the default passwords for `officer` and `admin`.
- Set a strong `JWT_SECRET` — never reuse the development default.
- Restrict `CORS_ORIGINS` to your real origins instead of `*`.
