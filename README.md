# ToastYourTime

Find your next reason to celebrate: enter your birth date and time, and see
when you'll turn 1,000,000,000 seconds, 10,000 days, 2,222 weeks, 444 months
and so on.

It's a static site written in plain TypeScript: no framework and no server.
Everything is calculated in the browser.

- `index.html`: page markup
- `src/main.ts`: form handling, share links and rendering
- `src/milestones.ts`: the milestone calculation
- `src/style.css`: styles

## Development

```bash
npm install
npm run dev        # dev server with hot reload
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ locally
```

## Share links

Results can be shared as `/<YYYYMMDD>_<HHmm>`, e.g. `/19900101_1200`
(local time). The app reads the date from the path, so the web server must
answer unknown paths with `index.html`. The dev and preview servers already do
this, and the included nginx config does it for production.

## Deployment

The site is built by a short-lived Docker container that writes the static
files to a folder on the host and then exits. Any web server can serve that
folder. It's set up for [SWAG](https://docs.linuxserver.io/general/swag/)
(nginx).

1. Build into a folder your nginx serves:

   ```bash
   OUTPUT_DIR=/path/to/swag/config/www/toastyourtime docker compose run --rm build
   ```

   `OUTPUT_DIR` can also go into a `.env` file next to `docker-compose.yml`.

2. Once, copy `deploy/toastyourtime.subdomain.conf` to SWAG's
   `/config/nginx/site-confs/`, adjust `server_name` and `root`, and restart
   SWAG.

To update the live site, run `git pull` followed by the build command from
step 1. The site can be briefly incomplete while the build replaces the files.
