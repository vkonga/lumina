# Lumina Studio Backend: Google Cloud Workload Identity Federation & CI/CD Guide

Due to your GCP Organization Policy disabling long-lived Service Account JSON Key creation (`constraints/iam.disableServiceAccountKeyCreation`), this guide uses **Workload Identity Federation (WIF)**. 

WIF is the industry-standard security best practice: it establishes a secure cryptographic trust relationship between GitHub and GCP, using short-lived tokens instead of permanent, vulnerable keys.

---

## 📋 Table of Contents
1. [Step 1: GCP Project & API Activation](#step-1-gcp-project--api-activation)
2. [Step 2: Google Cloud SQL (PostgreSQL) Setup](#step-2-google-cloud-sql-postgresql-setup)
3. [Step 3: Google Cloud Storage (GCS) Setup](#step-3-google-cloud-storage-gcs-setup)
4. [Step 4: Configure Workload Identity Federation (WIF)](#step-4-configure-workload-identity-federation-wif)
5. [Step 5: Configure GitHub Secrets](#step-5-configure-github-secrets)
6. [Step 6: Verify and Trigger Deployment](#step-6-verify-and-trigger-deployment)

---

## Step 1: GCP Project & API Activation

### 1. Identify Your Project Details:
* Get your **GCP Project ID** (e.g., `lumina-studio-415822`).
* Get your **GCP Project Number** (found on the Cloud Console homepage under Project Info).

### 2. Enable Required APIs:
Open the [GCP Cloud Shell](https://shell.cloud.google.com/) (click the terminal icon `>_` at the top-right of the GCP Console) and run:
```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  iamcredentials.googleapis.com
```

---

## Step 2: Google Cloud SQL (PostgreSQL) Setup

If you need a database hosted on Google Cloud SQL, open the **Cloud Shell** and run:

```bash
# 1. Create a PostgreSQL 15 Instance (micro tier for dev/testing)
gcloud sql instances create lumina-db-instance \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_ROOT_PASSWORD

# 2. Create the "lumina" database
gcloud sql databases create lumina --instance=lumina-db-instance

# 3. Create your app database user
gcloud sql users create lumina_user \
  --instance=lumina-db-instance \
  --password=YOUR_USER_PASSWORD
```

---

## Step 3: Google Cloud Storage (GCS) Setup

Create a bucket to store product image uploads:
```bash
# 1. Create a storage bucket
gcloud storage buckets create gs://lumina-uploads-YOUR_PROJECT_ID \
  --location=us-central1 \
  --uniform-bucket-level-access

# 2. Grant public read permission (so frontends can load product images)
gcloud storage buckets add-iam-policy-binding gs://lumina-uploads-YOUR_PROJECT_ID \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

---

## Step 4: Configure Workload Identity Federation (WIF)

Copy, customize, and paste these commands directly into your **GCP Cloud Shell**:

```bash
# 1. Set environment variables for copy-pasting (replace with your details!)
export PROJECT_ID="YOUR_GCP_PROJECT_ID"
export GITHUB_REPO="YOUR_GITHUB_USERNAME_OR_ORG/YOUR_REPO_NAME" # e.g., "myorg/lumina"

gcloud config set project $PROJECT_ID

# 2. Create a Service Account for GitHub Actions
gcloud iam service-accounts create github-deployer \
  --description="Service account for GitHub Actions deployment" \
  --display-name="GitHub Deployer"

# 3. Grant deployment roles to the Service Account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 4. Create the Workload Identity Pool
gcloud iam workload-identity-pools create lumina-github-pool \
  --location="global" \
  --description="Workload Identity Pool for GitHub Actions" \
  --display-name="GitHub Pool"

# 5. Create the Workload Identity Provider inside the pool
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --workload-identity-pool="lumina-github-pool" \
  --location="global" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.subject,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --display-name="GitHub Provider"

# 6. Retrieve the full Pool Name path
POOL_NAME=$(gcloud iam workload-identity-pools describe lumina-github-pool --location="global" --format="value(name)")

# 7. Map the Service Account to your GitHub repository
gcloud iam service-accounts add-iam-policy-binding github-deployer@$PROJECT_ID.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_NAME}/attribute.repository/${GITHUB_REPO}"
```

### 🔍 Retrieve the Workload Identity Provider String:
To get the exact string needed for GitHub secrets, run:
```bash
gcloud iam workload-identity-pools providers describe github-provider \
  --workload-identity-pool="lumina-github-pool" \
  --location="global" \
  --format="value(name)"
```
*It will print a path like:*  
`projects/YOUR_PROJECT_NUMBER/locations/global/workloadIdentityPools/lumina-github-pool/providers/github-provider`

---

## Step 5: Configure GitHub Secrets

Go to your GitHub Repository > **Settings** > **Secrets and variables** > **Actions**, and add the following **Repository Secrets**:

### 🔐 Authentication Secrets:
1. `GCP_PROJECT_ID`: Your GCP Project ID (e.g. `lumina-studio-415822`).
2. `GCP_SERVICE_ACCOUNT`: `github-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com`
3. `GCP_WORKLOAD_IDENTITY_PROVIDER`: The full path string printed at the end of **Step 4** (e.g., `projects/1234567890/locations/global/workloadIdentityPools/lumina-github-pool/providers/github-provider`).

### ⚙️ Application & Database Secrets:
* `DB_USER`: `lumina_user`
* `DB_NAME`: `lumina`
* `DB_PASSWORD`: Your database user password.
* `DB_HOST`: The Unix Socket path (e.g., `/cloudsql/YOUR_PROJECT_ID:us-central1:lumina-db-instance`).
* `GCS_BUCKET_NAME`: Your storage bucket name (e.g., `lumina-uploads-YOUR_PROJECT_ID`).

---

## Step 6: Verify and Trigger Deployment

1. Commit and push your changes to your deploy branch (`main`, `dev`, `qa`, or `prod`).
2. Navigate to your repository's **Actions** tab on GitHub.
3. The workflow will boot, securely handshake with GCP using OIDC, build your container image, push it to GCP registry, and deploy it to Google Cloud Run automatically!
