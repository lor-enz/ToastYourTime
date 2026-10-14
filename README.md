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
answer unknown paths with the app. The dev and preview servers already do
this. On GitHub Pages, the deploy workflow copies `index.html` to `404.html`,
which Pages serves for every unknown path. Browsers load the app normally, but
the response has a 404 status, so link previews in chat apps may stay empty.

## Deployment

The site is hosted on GitHub Pages at <https://toastyourtime.lorenz.kiwi/>.
The [deploy workflow](.github/workflows/deploy.yml) builds and publishes it on
every push to `main`, and test-builds every pull request. Merging to `main` is
all it takes to update the live site.

### One-time setup

1. Make the repository public (Pages on private repositories needs a paid
   plan).
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Add a DNS record: `toastyourtime.lorenz.kiwi CNAME lor-enz.github.io`.
4. In **Settings → Pages**, enter `toastyourtime.lorenz.kiwi` as the custom
   domain and, once the certificate is ready, tick **Enforce HTTPS**.
