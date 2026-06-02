# Modern Development — Lead Magnets

The single GitHub Pages repo for **all** Modern Development lead-magnet pages.
Served at **go.moderndevelopment.co**.

## Live magnets

| URL | Magnet | Folder |
|-----|--------|--------|
| go.moderndevelopment.co/ | Tools index | `index.html` |
| go.moderndevelopment.co/build | Build Cost Estimator | `build/` |
| go.moderndevelopment.co/land | Lot Buildability Scorecard | `land/` |

## How to add a new magnet (the whole flow)

1. Copy the `_template/` folder and rename it to the URL path you want, e.g. `cp -r _template barndo` → lives at `go.moderndevelopment.co/barndo`.
2. Open the new `index.html` and fill in the 4 marked spots: title, description, `GHL_WEBHOOK_URL`, `LEAD_NAME`.
3. Build out the magnet's content + lead form.
4. `git add -A && git commit -m "Add <name> magnet" && git push`.
5. Live in ~60 seconds. No new repo, no new DNS, no new certificate.

## What's pre-wired in every magnet

- **Meta Pixel** `942834204826443` ("Meca Marketing Data") — fires PageView on load.
- **Lead event** — fires `fbq('track','Lead')` on form submit so Meta conversion ads can optimize on completions.
- **GoHighLevel** — form POSTs to a GHL inbound webhook (set per magnet).

## Pointing ads here

Always use `https://go.moderndevelopment.co/<path>`. The pixel must be shared to
the running ad account (Megan's, act_1629176468207399) in Business Settings.
