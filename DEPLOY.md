# Deploy runbook — 心富塔羅 Richly → https://tarot.richhsu.net

Audience: a Claude Code session (or a human) on Rich's own computer, with `gh` logged in as
`richatrak` and AWS credentials for the Route 53 zone of `richhsu.net`.
The cloud session that built the app cannot push to GitHub or touch DNS, so this hands off the rest.

## 0. Gate — confirm with Rich before doing anything public
Ask Rich and record the answers. **Do not continue past step 2 without a yes on all three.**
- [ ] Subdomain is `tarot.richhsu.net` (recommended). Once published, **never change it**: the browser
      ties history, the daily card, the saved question and the installed home-screen app to the exact
      origin; a new hostname resets everything for every user.
- [ ] OK to create a **public** repo `richatrak/tarot.richhsu.net` (free GitHub Pages needs public). Code and all
      78 card texts become publicly readable. Optional: add a LICENSE (e.g. MIT for code, CC BY-NC 4.0 for text).
- [ ] OK that the site is publicly reachable and associated with the name "richhsu".

Not in scope unless Rich asks: App Store / Play Store, analytics, paid services, touching other repos
(e.g. the stuck `ielts-app` Pages build), deleting the stray `ietls` repo.

## 1. Preflight checks (read-only)
```bash
gh auth status                              # must show richatrak with 'repo' + 'workflow' scopes
gh api user --jq .login                     # -> richatrak
aws sts get-caller-identity
aws route53 list-hosted-zones-by-name --dns-name richhsu.net --max-items 1
# Domain expiry / auto-renew (domain expires 2027-06-09 — auto-renew should be ON):
aws route53domains get-domain-detail --region us-east-1 --domain-name richhsu.net \
  --query '{AutoRenew:AutoRenew,Expiry:ExpirationDate}'
# The name must be unused:
dig +short CNAME tarot.richhsu.net; dig +short A tarot.richhsu.net   # both empty
gh repo view richatrak/tarot.richhsu.net 2>&1 | head -1                    # "Could not resolve" = free
```
If auto-renew is OFF, tell Rich (don't change billing settings yourself).

## 2. Restore the project from the git bundle
Rich has `tarot-richly.bundle` (sent from the cloud session). The same bundle is also published,
base64-encoded, inside the handoff artifact as `tarot-richly.bundle.b64.txt`.
```bash
# If you have the .b64.txt instead of the .bundle:
base64 -d tarot-richly.bundle.b64.txt > tarot-richly.bundle
echo "<sha256 from the artifact>  tarot-richly.bundle" | shasum -a 256 -c   # must say OK
git bundle verify tarot-richly.bundle
git clone -b main tarot-richly.bundle tarot.richhsu.net && cd tarot.richhsu.net
git remote remove origin            # origin points at the bundle file
git log --oneline | head            # top commit should match the artifact
```
Sanity build (Node 22):
```bash
npm ci && npm test && npm run build    # 20 unit tests pass; dist/ has index.html, sw.js, manifest.webmanifest
```

## 3. Create the repo and push
```bash
gh repo create richatrak/tarot.richhsu.net --public \
  --description "心富塔羅 Richly — zh-TW tarot reflection PWA (offline)" \
  --source . --remote origin --push
```

## 4. Turn on GitHub Pages (source = GitHub Actions)
```bash
gh api -X POST repos/richatrak/tarot.richhsu.net/pages -f build_type=workflow
gh workflow run "Deploy to GitHub Pages" -R richatrak/tarot.richhsu.net   # or wait for the push-triggered run
gh run watch -R richatrak/tarot.richhsu.net --exit-status
```
If the first run failed only because Pages was not enabled yet, re-run it.

## 5. (Recommended) Verify `richhsu.net` for GitHub Pages — takeover protection
GitHub web UI: **github.com/settings/pages → Add a domain → `richhsu.net`**. GitHub shows a TXT record like
`_github-pages-challenge-richatrak.richhsu.net` = `<code>`. Add it in Route 53 (same UPSERT pattern as
step 6, Type `TXT`, value in double quotes), wait, then click **Verify**. Keep the TXT record afterwards.
This stops anyone else from claiming `*.richhsu.net` on GitHub Pages if a CNAME is ever left dangling.

## 6. DNS: CNAME tarot.richhsu.net → richatrak.github.io
```bash
ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name richhsu.net --max-items 1 \
  --query 'HostedZones[0].Id' --output text | sed 's#/hostedzone/##')
cat > /tmp/tarot-cname.json <<'JSON'
{ "Comment": "Richly tarot PWA on GitHub Pages",
  "Changes": [{ "Action": "UPSERT", "ResourceRecordSet": {
    "Name": "tarot.richhsu.net.", "Type": "CNAME", "TTL": 300,
    "ResourceRecords": [{ "Value": "richatrak.github.io" }] } }] }
JSON
aws route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" --change-batch file:///tmp/tarot-cname.json
dig +short tarot.richhsu.net        # -> richatrak.github.io. + 185.199.108-111.153
```
Same pattern as the existing `github.richhsu.net` and the `*.kidz.tw` sites.

## 7. Attach the custom domain and enforce HTTPS
```bash
gh api -X PUT repos/richatrak/tarot.richhsu.net/pages -f cname=tarot.richhsu.net
# Certificate issuance takes minutes (up to ~1h). Poll until state is "approved"/"issued":
gh api repos/richatrak/tarot.richhsu.net/pages --jq '{cname, status, https_certificate}'
gh api -X PUT repos/richatrak/tarot.richhsu.net/pages -F https_enforced=true
```
With a GitHub-Actions Pages source no `CNAME` file is needed in the build; the domain lives in repo settings.

## 8. Verify the live site
```bash
curl -sI https://tarot.richhsu.net/ | head -3                       # HTTP/2 200
curl -s https://tarot.richhsu.net/manifest.webmanifest | head -c 200 # "name":"心富塔羅 Richly"
curl -sI https://tarot.richhsu.net/sw.js | head -1                   # 200
curl -sI http://tarot.richhsu.net/ | grep -i location                # redirects to https
```
Then in desktop Chrome: open the site, header pill should turn to 「離線資源已就緒 (16/16)」;
DevTools → Application → Manifest shows no errors; Network → Offline → reload → draw a Celtic Cross.

## 9. Real-device tests (still open — record results in README "Verification status")
**iPhone Safari** (the key one, never tested yet):
1. Online: open https://tarot.richhsu.net → wait for 已就緒.
2. Share → 加入主畫面 → open from the icon **while online**, wait for 已就緒 again (home-screen app has separate storage).
3. Airplane mode → force-quit the app → reopen from icon.
4. Turn reversals on, draw 凱爾特十字 → check every card's 正位/逆位 label matches its meaning text; tap a card → jumps to its meaning.
5. Rotate to landscape; type a question, draw, check it appears in 紀錄; 清除所有本機資料 works.

**Android Chrome**: same, plus "Install app" prompt. **Desktop**: Chrome/Edge install, Safari macOS, Firefox (no install, offline should still work).

## 10. Updating later
Push to `main` → Actions tests + deploys. Open apps show 「有新版本可用 → 立即更新」. Bump `version` in `package.json`.

## Rollback / removal (avoid dangling DNS)
1. Delete the Route 53 CNAME `tarot.richhsu.net` **first** (same JSON with `"Action": "DELETE"`, identical record values).
2. Then `gh api -X DELETE repos/richatrak/tarot.richhsu.net/pages` and/or archive/delete the repo.
Never leave the CNAME pointing at github.io without a repo claiming it.

## Concerns recap
- Origin is permanent (see step 0). Don't use `github.richhsu.net/<path>`: it shares one origin (localStorage, SW scope) with `xc90` and `ielts-app`.
- `richhsu.net` expires 2027-06-09 → keep auto-renew on; a lapse breaks every installed copy and lets someone else take the name.
- GitHub Pages: public repo, not for commercial use; move hosting if it ever becomes paid.
- Real name in the URL links "tarot" with "Rich Hsu" publicly — Rich's call.
- Optional: add `<meta name="robots" content="noindex">` while in beta if Rich doesn't want search indexing yet.
