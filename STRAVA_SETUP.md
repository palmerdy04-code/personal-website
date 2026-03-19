# Strava Setup

## 1. Create a Strava App
Open `https://www.strava.com/settings/api` and create an app.

Use these values while developing locally:
- Authorization Callback Domain: `localhost`
- Website: `http://localhost:8000`
- Redirect URI we will use in code: `http://localhost:8000/auth/strava/callback`

Use these values once the site is public:
- Authorization Callback Domain: your public domain only, for example `dylan-palmer-website.onrender.com`
- Website: your public site URL
- Redirect URI: `https://your-public-domain/auth/strava/callback`

## 2. Export your local environment variables
In the terminal before starting the site, run:

```bash
export STRAVA_CLIENT_ID="your_client_id"
export STRAVA_CLIENT_SECRET="your_client_secret"
export STRAVA_REDIRECT_URI="http://localhost:8000/auth/strava/callback"
```

For Render, add the same values in the service's environment variables instead of exporting them locally. Also set:

```bash
PUBLIC_BASE_URL="https://your-public-domain"
DATA_DIR="/var/data"
```

## 3. Start the site
Run:

```bash
python3 server.py
```

Then open `http://localhost:8000` and go to the `Running` tab.

## 4. Connect Strava
Click the connect button in the running dashboard. After you authorize, the site will bring you back to the `Running` tab.

## Notes
- Tokens are stored locally in `.strava_tokens.json`
- Cached dashboard data is stored in `.strava_dashboard_cache.json`
- Both are ignored by git
- Use `http://localhost:8000/api/strava/dashboard?refresh=1` to force a refresh
- On Render, keep the service on a single instance because the Strava tokens/cache are stored on disk
