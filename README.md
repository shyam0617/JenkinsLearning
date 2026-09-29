# Jenkins + Docker — Full End-to-End Learning Project

A tiny Node.js (ES modules) app you use to learn the **complete** CI/CD flow:

```
  git push ──▶ GitHub ──(WEBHOOK)──▶ Jenkins ──▶ pipeline runs:
                                                  Checkout
                                                  Install
                                                  Test
                                                  Build Docker image
                                                  Deploy container
                                                       │
                                                       ▼
                                                 App is live
```

We do it **locally first** (free, using ngrok so webhooks reach your machine),
then the last section shows how to move the exact same setup to a **cloud server
with a real domain**.

---

## The app (what we're deploying)

| File | Purpose |
|------|---------|
| `app.js` | Minimal Express server (routes `/` and `/health`), port 3000 |
| `greet.js` | A pure function — kept separate so it's easy to test |
| `test/greet.test.js` | Real tests (Node's built-in test runner) |
| `Dockerfile` | Packages the app into a Docker image |
| `Jenkinsfile` | The pipeline (5 stages) |
| `jenkins/` | Runs Jenkins itself (Jenkins + Docker CLI) |

Run it directly to see it work:
```bash
npm install
npm test          # 2 tests pass
npm start         # open http://localhost:3000  and  /?name=Shyam
```

---

## STEP 1 — Put this project on GitHub

Jenkins pulls the code (and the `Jenkinsfile`) from GitHub, and GitHub is what
sends the webhook. So the project must live in a GitHub repo.

```bash
cd jenkins-learning
git init
echo "node_modules" > .gitignore
git add .
git commit -m "Jenkins + Docker learning project"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/jenkins-learning.git
git branch -M main
git push -u origin main
```

---

## STEP 2 — Start Jenkins (in Docker)

```bash
cd jenkins
docker compose up -d --build      # first build takes a few minutes
docker ps                          # confirm the "jenkins" container is up
```

Get the one-time admin password:
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Open **http://localhost:8080**, paste the password, click **Install suggested
plugins**, create your admin user, and finish.

---

## STEP 3 — How the WEBHOOK works (and why we need ngrok)

A webhook is just GitHub sending an HTTP request to Jenkins on every push:

```
git push ─▶ GitHub ─(HTTP POST)─▶  http://<jenkins>/github-webhook/
```

Problem: GitHub lives on the internet, but your Jenkins is at
`http://localhost:8080`, which only exists on your machine. **GitHub cannot reach
localhost.** So we give localhost a temporary public URL with **ngrok**.

### Install & run ngrok
1. Sign up (free) at https://ngrok.com and install it (or run the docker image).
2. Point it at Jenkins:
   ```bash
   ngrok http 8080
   ```
3. It prints a public URL, e.g. `https://a1b2c3.ngrok-free.app`.
   That URL now forwards to your local Jenkins. Keep this terminal open.

---

## STEP 4 — Connect GitHub → Jenkins (the webhook)

### 4a. Add the webhook on GitHub
In your GitHub repo: **Settings → Webhooks → Add webhook**
- **Payload URL:** `https://a1b2c3.ngrok-free.app/github-webhook/`
  (your ngrok URL + `/github-webhook/` — the trailing slash matters)
- **Content type:** `application/json`
- **Events:** *Just the push event*
- **Add webhook**

### 4b. Tell Jenkins to listen
Make sure the **GitHub plugin** is installed (it is, via "suggested plugins").
Nothing else needed here — the job in Step 5 enables the trigger.

---

## STEP 5 — Create the pipeline job (with the UI)

1. Jenkins → **New Item** → name `jenkins-demo` → **Pipeline** → **OK**.
2. Under **Build Triggers**, check
   **"GitHub hook trigger for GITScm polling"**  ← this makes the webhook fire builds.
3. Under **Pipeline**:
   - **Definition:** `Pipeline script from SCM`
   - **SCM:** `Git`
   - **Repository URL:** your repo URL
   - **Branch:** `*/main`
   - **Script Path:** `Jenkinsfile`
4. **Save**.

---

## STEP 6 — See it all work 🎉

1. Click **Build Now** once to test manually.
2. Watch the **Stage View** UI — each stage turns green:
   `Checkout → Install → Test → Build Docker Image → Deploy`
3. Verify the deployed app:
   ```bash
   docker ps                         # see the "jenkins-demo" container
   curl http://localhost:3000/health # {"status":"ok"}
   ```

### Now the real magic — automatic deploys
Change `greet.js` (e.g. make it return `"Hi, ..."`), then:
```bash
git add . && git commit -m "change greeting" && git push
```
The push → webhook → Jenkins **automatically** runs the whole pipeline and
redeploys. No clicking. **That is CI/CD.**

> Tip: if a test fails, the pipeline STOPS at the Test stage and never deploys
> the broken code. Try breaking a test on purpose and pushing to see it.

---

## STEP 7 — Move to a real domain (production)

The setup is identical — you just run Jenkins on a public server instead of
localhost, so you no longer need ngrok.

1. **Rent a small cloud VM** (DigitalOcean droplet, AWS EC2, etc.). Install Docker.
2. **Copy this project** to the server and run the same
   `cd jenkins && docker compose up -d --build`.
3. Jenkins now has a **public IP / domain**, so the GitHub webhook Payload URL
   becomes `http://your-domain.com:8080/github-webhook/` — **no ngrok needed**.
4. The `Deploy` stage runs your app container on the server; point your domain
   (via DNS) at the server and (optionally) put Nginx in front for port 80/443.

Everything else — `Dockerfile`, `Jenkinsfile`, the stages, the webhook flow —
stays exactly the same. That's the payoff of learning it locally first.

---

## Cheat sheet

```bash
# Jenkins
cd jenkins
docker compose up -d --build    # start / rebuild
docker compose down             # stop (keep data)
docker compose down -v          # stop + delete data
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# ngrok (public URL for webhooks)
ngrok http 8080

# the deployed app
docker ps
docker logs jenkins-demo
curl http://localhost:3000/health
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker: not found` in pipeline | Start Jenkins with `--build` (adds Docker CLI). |
| `permission denied /var/run/docker.sock` | Keep `user: root` in `jenkins/docker-compose.yml`. |
| Webhook doesn't trigger builds | Check GitHub → Webhooks → "Recent Deliveries" for a green ✔ / the response code. URL must end in `/github-webhook/`. |
| ngrok URL changed | Free ngrok URLs change on restart — update the GitHub webhook URL. |
| Port 8080 or 3000 in use | Change the port mapping in the compose / `APP_PORT` in the Jenkinsfile. |
