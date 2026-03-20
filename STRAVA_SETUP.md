# Strava Setup

## 1. Create a Strava App
Open `https://www.strava.com/settings/api` and create an app.

Use these values while developing locally:
- Authorization Callback Domain: `localhost`
- Website: `http://localhost:8000`
- Redirect URI we will use in code: `http://localhost:8000/auth/strava/callback`

If you only plan to export Strava data locally and publish the site as static files, you do not need a public callback URL.

## 2. Export your local environment variables
In the terminal before exporting data locally, run:

```bash
export STRAVA_CLIENT_ID="your_client_id"
export STRAVA_CLIENT_SECRET="your_client_secret"
export STRAVA_REDIRECT_URI="http://localhost:8000/auth/strava/callback"
```

## 3. Connect Strava once locally
Run:

```bash
python3 server.py
```

Then open `http://localhost:8000` and go to the `Running` tab.

## 4. Connect Strava
Click the connect button in the running dashboard. After you authorize, the site will bring you back to the `Running` tab.

## 5. Export the static snapshot
Once connected, export the dashboard snapshot that the public site will read:

```bash
python3 server.py export-strava-data
```

If you want to force a fresh read from Strava instead of reusing the local cache:

```bash
python3 server.py export-strava-data --refresh
```

This writes the public snapshot to `data/strava-dashboard.json`.

## 6. Publish updates
After exporting new data:

```bash
git add data/strava-dashboard.json
git commit -m "Refresh Strava dashboard data"
git push
```

## Notes
- Tokens are stored locally in `.strava_tokens.json`
- Cached dashboard data is stored in `.strava_dashboard_cache.json`
- Both are ignored by git
- `data/strava-dashboard.json` should be committed so the public site can read it
- You can still preview locally with `python3 server.py`, but the public site no longer needs the backend
