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
this.
