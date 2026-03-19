#!/usr/bin/env python3
import json
import math
import os
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib import error, parse, request

ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get('DATA_DIR', str(ROOT))).expanduser()
TOKEN_FILE = DATA_DIR / '.strava_tokens.json'
CACHE_FILE = DATA_DIR / '.strava_dashboard_cache.json'
CACHE_TTL_SECONDS = 60 * 60 * 6
RECENT_RUN_PAGE_LIMIT = 3
STRAVA_BASE = 'https://www.strava.com'
STRAVA_API_BASE = 'https://www.strava.com/api/v3'
ENV_FILE = ROOT / '.env'


def load_env_file(path):
    if not path.exists():
        return

    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


load_env_file(ENV_FILE)
PR_TARGETS = [
    {'label': '1/4 mile', 'meters': 402.336, 'tolerance': 120},
    {'label': '1 mile', 'meters': 1609.344, 'tolerance': 220},
    {'label': '2 mile', 'meters': 3218.688, 'tolerance': 260},
    {'label': '5k', 'meters': 5000, 'tolerance': 260},
    {'label': '10k', 'meters': 10000, 'tolerance': 400},
    {'label': 'half marathon', 'meters': 21097.5, 'tolerance': 800},
    {'label': 'marathon', 'meters': 42195, 'tolerance': 1600},
]


def env(name, default=None):
    value = os.environ.get(name, default)
    return value.strip() if isinstance(value, str) else value


CLIENT_ID = env('STRAVA_CLIENT_ID')
CLIENT_SECRET = env('STRAVA_CLIENT_SECRET')
REDIRECT_URI = env('STRAVA_REDIRECT_URI', 'http://localhost:8000/auth/strava/callback')
SCOPES = env('STRAVA_SCOPES', 'read,activity:read_all')
PUBLIC_BASE_URL = env('PUBLIC_BASE_URL')


def json_response(handler, payload, status=200):
    body = json.dumps(payload).encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(body)))
    handler.send_header('Cache-Control', 'no-store')
    handler.end_headers()
    handler.wfile.write(body)


def redirect(handler, location):
    handler.send_response(302)
    handler.send_header('Location', location)
    handler.end_headers()


def load_json(path):
    if not path.exists():
        return None
    return json.loads(path.read_text())


def save_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2))


def require_config():
    return bool(CLIENT_ID and CLIENT_SECRET and REDIRECT_URI)


def post_form(url, form_data):
    data = parse.urlencode(form_data).encode('utf-8')
    req = request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    with request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))


def api_get(path, access_token, params=None):
    query = ''
    if params:
        query = '?' + parse.urlencode(params)
    req = request.Request(f'{STRAVA_API_BASE}{path}{query}')
    req.add_header('Authorization', f'Bearer {access_token}')
    with request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))


def exchange_code_for_token(code):
    payload = post_form(
        f'{STRAVA_BASE}/oauth/token',
        {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
        },
    )
    save_json(TOKEN_FILE, payload)
    return payload


def refresh_tokens(tokens):
    if not tokens:
        return None
    expires_at = tokens.get('expires_at', 0)
    if time.time() < expires_at - 120:
        return tokens

    payload = post_form(
        f'{STRAVA_BASE}/oauth/token',
        {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'grant_type': 'refresh_token',
            'refresh_token': tokens['refresh_token'],
        },
    )
    save_json(TOKEN_FILE, payload)
    return payload


def current_tokens():
    tokens = load_json(TOKEN_FILE)
    if not tokens:
        return None
    return refresh_tokens(tokens)


def parse_datetime(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def start_of_week(dt):
    local = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    return local - timedelta(days=local.weekday())


def meters_to_miles(value):
    return round(value / 1609.344, 1)


def meters_to_feet(value):
    return round(value * 3.28084)


def seconds_to_hours(value):
    return round(value / 3600, 1)


def format_location(run):
    parts = [
        run.get('location_city'),
        run.get('location_state'),
        run.get('location_country'),
    ]
    seen = []
    for part in parts:
        if not part:
            continue
        if part not in seen:
            seen.append(part)
    if seen:
        return ', '.join(seen)

    start = run.get('start_latlng') or []
    if len(start) == 2:
        return f"Start near {round(start[0], 3)}, {round(start[1], 3)}"

    return None


def best_distance_matches(runs):
    matches = []
    for target in PR_TARGETS:
        best = None
        for run in runs:
            distance = run.get('distance', 0.0)
            difference = abs(distance - target['meters'])
            if difference > target['tolerance']:
                continue
            candidate = {
                'label': target['label'],
                'elapsed_time': run.get('elapsed_time') or run.get('moving_time') or 0,
                'activity_name': run.get('name', 'Run'),
                'activity_url': f"https://www.strava.com/activities/{run['id']}",
                'date': run.get('start_date_local', ''),
                'distance_difference': difference,
            }
            if best is None:
                best = candidate
                continue
            if candidate['elapsed_time'] < best['elapsed_time']:
                best = candidate
                continue
            if candidate['elapsed_time'] == best['elapsed_time'] and candidate['distance_difference'] < best['distance_difference']:
                best = candidate
        matches.append(
            {
                'label': target['label'],
                'elapsed_time': best['elapsed_time'] if best else None,
                'activity_name': best['activity_name'] if best else 'No close race-distance activity found yet',
                'activity_url': best['activity_url'] if best else None,
                'date': best['date'] if best else None,
                'approximate': True,
            }
        )
    return matches


def polyline_decode(encoded):
    points = []
    index = lat = lng = 0
    length = len(encoded)

    while index < length:
        shift = result = 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlat = ~(result >> 1) if result & 1 else (result >> 1)
        lat += dlat

        shift = result = 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlng = ~(result >> 1) if result & 1 else (result >> 1)
        lng += dlng
        points.append((lat / 1e5, lng / 1e5))
    return points


def path_from_polyline(encoded, width=220, height=120, padding=10):
    if not encoded:
        return None
    points = polyline_decode(encoded)
    if len(points) < 2:
        return None

    lats = [p[0] for p in points]
    lngs = [p[1] for p in points]
    min_lat, max_lat = min(lats), max(lats)
    min_lng, max_lng = min(lngs), max(lngs)
    lat_span = max(max_lat - min_lat, 1e-6)
    lng_span = max(max_lng - min_lng, 1e-6)
    scale = min((width - 2 * padding) / lng_span, (height - 2 * padding) / lat_span)

    mapped = []
    for lat, lng in points:
        x = padding + (lng - min_lng) * scale
        y = height - padding - (lat - min_lat) * scale
        mapped.append((round(x, 2), round(y, 2)))

    commands = [f'M {mapped[0][0]} {mapped[0][1]}']
    commands.extend(f'L {x} {y}' for x, y in mapped[1:])
    return ' '.join(commands)


def load_cached_dashboard():
    cached = load_json(CACHE_FILE)
    if not cached:
        return None
    if time.time() - cached.get('generated_at', 0) > CACHE_TTL_SECONDS:
        return None
    return cached.get('payload')


def save_cached_dashboard(payload):
    save_json(CACHE_FILE, {'generated_at': time.time(), 'payload': payload})


def fetch_all_runs(access_token, max_pages=RECENT_RUN_PAGE_LIMIT):
    runs = []
    page = 1
    while page <= max_pages:
        batch = api_get('/athlete/activities', access_token, {'page': page, 'per_page': 100})
        if not batch:
            break
        runs.extend(activity for activity in batch if activity.get('type') == 'Run')
        if len(batch) < 100:
            break
        page += 1
    return runs


def build_dashboard(force_refresh=False):
    if not require_config():
        return {'configured': False, 'connected': False}

    if not force_refresh:
        cached = load_cached_dashboard()
        if cached:
            return cached

    tokens = current_tokens()
    if not tokens:
        return {'configured': True, 'connected': False}

    athlete = tokens.get('athlete') or api_get('/athlete', tokens['access_token'])
    stats = api_get(f"/athletes/{athlete['id']}/stats", tokens['access_token'])
    runs = fetch_all_runs(tokens['access_token'])
    runs.sort(key=lambda item: item.get('start_date_local', ''), reverse=True)

    weekly_totals = defaultdict(lambda: {'efforts': 0, 'distance': 0.0, 'moving_time': 0, 'elevation': 0.0})
    for run in runs:
        started = parse_datetime(run['start_date_local'])
        bucket = start_of_week(started).date().isoformat()
        weekly_totals[bucket]['efforts'] += 1
        weekly_totals[bucket]['distance'] += run.get('distance', 0.0)
        weekly_totals[bucket]['moving_time'] += run.get('moving_time', 0)
        weekly_totals[bucket]['elevation'] += run.get('total_elevation_gain', 0.0)

    recent_weeks = []
    for week in sorted(weekly_totals.keys(), reverse=True)[:6]:
        totals = weekly_totals[week]
        recent_weeks.append(
            {
                'week_start': week,
                'efforts': totals['efforts'],
                'distance_miles': meters_to_miles(totals['distance']),
                'moving_time_hours': seconds_to_hours(totals['moving_time']),
                'elevation_feet': meters_to_feet(totals['elevation']),
            }
        )

    current_week = recent_weeks[0] if recent_weeks else {'week_start': None, 'efforts': 0, 'distance_miles': 0, 'moving_time_hours': 0, 'elevation_feet': 0}

    recent_runs = runs[:10]
    route_cards = []
    for run in recent_runs:
        polyline = ((run.get('map') or {}).get('summary_polyline'))
        route_cards.append(
            {
                'name': run.get('name', 'Run'),
                'date': run.get('start_date_local', ''),
                'distance_miles': meters_to_miles(run.get('distance', 0.0)),
                'moving_time_minutes': round(run.get('moving_time', 0) / 60),
                'elevation_feet': meters_to_feet(run.get('total_elevation_gain', 0.0)),
                'location': format_location(run),
                'activity_url': f"https://www.strava.com/activities/{run['id']}",
                'svg_path': path_from_polyline(polyline) if polyline else None,
            }
        )

    prs = best_distance_matches(runs)

    payload = {
        'configured': True,
        'connected': True,
        'athlete': {
            'firstname': athlete.get('firstname', ''),
            'lastname': athlete.get('lastname', ''),
        },
        'updated_at': datetime.now(timezone.utc).isoformat(),
        'current_week': current_week,
        'weekly_totals': recent_weeks,
        'yearly_totals': {
            'count': stats.get('ytd_run_totals', {}).get('count', 0),
            'distance_miles': meters_to_miles(stats.get('ytd_run_totals', {}).get('distance', 0.0)),
            'moving_time_hours': seconds_to_hours(stats.get('ytd_run_totals', {}).get('moving_time', 0)),
            'elevation_feet': meters_to_feet(stats.get('ytd_run_totals', {}).get('elevation_gain', 0.0)),
        },
        'recent_totals': {
            'count': stats.get('recent_run_totals', {}).get('count', 0),
            'distance_miles': meters_to_miles(stats.get('recent_run_totals', {}).get('distance', 0.0)),
            'moving_time_hours': seconds_to_hours(stats.get('recent_run_totals', {}).get('moving_time', 0)),
            'elevation_feet': meters_to_feet(stats.get('recent_run_totals', {}).get('elevation_gain', 0.0)),
        },
        'data_window': f'Last {RECENT_RUN_PAGE_LIMIT * 100} activities max for detailed weekly and PR matching.',
        'prs': prs,
        'routes': route_cards,
    }
    save_cached_dashboard(payload)
    return payload


class WebsiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        parsed = parse.urlparse(self.path)

        if parsed.path == '/api/strava/status':
            tokens = load_json(TOKEN_FILE)
            return json_response(
                self,
                {
                    'configured': require_config(),
                    'connected': bool(tokens),
                    'redirect_uri': REDIRECT_URI,
                },
            )

        if parsed.path == '/api/strava/dashboard':
            params = parse.parse_qs(parsed.query)
            force_refresh = params.get('refresh', ['0'])[0] == '1'
            try:
                payload = build_dashboard(force_refresh=force_refresh)
                return json_response(self, payload)
            except error.HTTPError as exc:
                detail = exc.read().decode('utf-8', errors='ignore')
                cached = load_json(CACHE_FILE)
                if cached and cached.get('payload'):
                    payload = cached['payload']
                    payload['stale'] = True
                    payload['warning'] = 'Showing cached Strava data because the live read limit is currently exceeded.'
                    return json_response(self, payload, 200)
                if 'Rate Limit Exceeded' in detail:
                    message = 'Strava rate limit exceeded. Wait a bit and try again, or use the cached dashboard once it exists.'
                else:
                    message = detail or str(exc)
                return json_response(self, {'configured': True, 'connected': False, 'error': message}, 502)
            except Exception as exc:
                return json_response(self, {'configured': True, 'connected': False, 'error': str(exc)}, 500)

        if parsed.path == '/auth/strava/start':
            if not require_config():
                return json_response(self, {'error': 'Strava environment variables are not configured.'}, 400)
            query = parse.urlencode(
                {
                    'client_id': CLIENT_ID,
                    'redirect_uri': REDIRECT_URI,
                    'response_type': 'code',
                    'approval_prompt': 'auto',
                    'scope': SCOPES,
                }
            )
            return redirect(self, f'{STRAVA_BASE}/oauth/authorize?{query}')

        if parsed.path == '/auth/strava/callback':
            params = parse.parse_qs(parsed.query)
            code = params.get('code', [None])[0]
            if not code:
                return json_response(self, {'error': 'Missing authorization code.'}, 400)
            exchange_code_for_token(code)
            if CACHE_FILE.exists():
                CACHE_FILE.unlink()
            return redirect(self, '/?connected=strava#running')

        if parsed.path == '/':
            self.path = '/index.html'
        return super().do_GET()


def main():
    port = int(env('PORT', '8000'))
    httpd = HTTPServer(('0.0.0.0', port), WebsiteHandler)
    local_url = f'http://localhost:{port}'
    public_url = PUBLIC_BASE_URL or local_url
    print(f'Serving Dylan website with Strava support at {public_url} (local: {local_url})')
    httpd.serve_forever()


if __name__ == '__main__':
    main()
