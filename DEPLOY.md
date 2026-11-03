# Deploying to Google Cloud Run

The container runs everything in one place: a local test blockchain (in memory), the contract, and the web page.
The page talks to the blockchain through `/rpc` on the same address. Only normal `eth_*` calls are let through;
Hardhat's admin calls (reset the chain, give yourself ETH) are blocked.

Good to know before you deploy:

- **The chain resets** whenever Cloud Run starts a new container (after a new deploy, or after it has been idle and
  scaled to zero). Invoices and balances start over. That's fine for a demo.
- **One instance only** (`--max-instances 1`), so everyone using the link sees the same blockchain.
- The ETH is fake and the test wallets are Hardhat's well-known public test accounts. Nothing here is connected to
  the real Ethereum network.

## 1. One-time setup

Install the gcloud SDK (macOS with Homebrew) and log in:

```bash
brew install --cask google-cloud-sdk
```

```bash
gcloud auth login
```

Set these for your shell (change the project id; pick a region near you):

```bash
export PROJECT_ID=your-project-id
export REGION=europe-west1
export REPO=demos
export IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/eth-payment-demo
```

```bash
gcloud config set project $PROJECT_ID
```

Turn on Cloud Run and Artifact Registry:

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
```

Create a Docker repository in Artifact Registry:

```bash
gcloud artifacts repositories create $REPO --repository-format=docker --location=$REGION --description="Demo images"
```

Let Docker push to it:

```bash
gcloud auth configure-docker $REGION-docker.pkg.dev
```

## 2. Build and push the image

Run from the project folder. `--platform linux/amd64` matters on Apple Silicon Macs: Cloud Run needs amd64 images.

```bash
docker build --platform linux/amd64 -t $IMAGE:v1 .
```

```bash
docker push $IMAGE:v1
```

## 3. Deploy to Cloud Run

```bash
gcloud run deploy eth-payment-demo \
  --image $IMAGE:v1 \
  --region $REGION \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1 \
  --allow-unauthenticated
```

It prints the service URL (`https://eth-payment-demo-….run.app`). Open it; add `/tr.html` for Turkish.

`--allow-unauthenticated` makes the link public. If your organisation blocks public services, leave that flag out
and open it through a local tunnel instead:

```bash
gcloud run services proxy eth-payment-demo --region $REGION --port 8090
```

Then go to http://localhost:8090.

## Updating

Change the code, then build and push with a new tag and deploy that tag:

```bash
docker build --platform linux/amd64 -t $IMAGE:v2 .
```

```bash
docker push $IMAGE:v2
```

```bash
gcloud run deploy eth-payment-demo --image $IMAGE:v2 --region $REGION
```

## Test the image locally first (optional)

```bash
docker run --rm -p 8095:8080 $IMAGE:v1
```

Then open http://localhost:8095.

## Removing it

```bash
gcloud run services delete eth-payment-demo --region $REGION
```

```bash
gcloud artifacts repositories delete $REPO --location $REGION
```

## Cost

With `--min-instances 0` you pay only while someone is using it; a demo like this normally stays inside Cloud Run's
free tier. Artifact Registry charges for storage beyond 0.5 GB (about $0.10 per GB per month). This image is about 1.6 GB
unpacked, so expect a few cents a month; delete old tags you no longer need.
