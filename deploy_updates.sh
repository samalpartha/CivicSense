#!/bin/bash
set -e

echo "========================================================"
echo "   CivicSense Cloud Deployment Updater"
echo "========================================================"

# 1. Verify GCloud Auth
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
   echo "❌ Error: Not authenticated."
   echo "   Please run: gcloud auth login"
   exit 1
fi

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
echo "✅ Authenticated to Project: $PROJECT_ID"
echo "✅ Region: $REGION"

# 2. Deploy Backend
echo ""
echo "🚀 [1/2] Deploying Backend Service..."
echo "-------------------------------------"

gcloud builds submit --tag gcr.io/$PROJECT_ID/civicsense-backend ./services/backend

gcloud run deploy civicsense-backend \
    --image gcr.io/$PROJECT_ID/civicsense-backend \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi

# 3. Get Backend URL for Frontend Config
BACKEND_URL=$(gcloud run services describe civicsense-backend --region $REGION --format 'value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

# 4. Deploy Frontend
echo ""
echo "🚀 [2/2] Deploying Frontend Service..."
echo "-------------------------------------"

# Pass the Backend URL to the frontend build via --build-arg
gcloud builds submit \
    --tag gcr.io/$PROJECT_ID/civicsense-frontend \
    --substitutions=_VITE_API_URL="$BACKEND_URL" \
    ./services/websocket/frontend

# Note: Cloud Build substitutions don't directly map to Docker --build-arg unless specified in cloudbuild.yaml.
# Since we are using automatic submission, we should use --build-arg if running docker build locally, 
# but for `gcloud builds submit` without a config, it expects a Dockerfile.
# We'll use a trick: Create a temporary cloudbuild.yaml or just rely on the env var being baked in if we run `docker build` remotely.
# Actually, the simplest way for a hackathon:
# Just let Cloud Build use the Dockerfile. But we need to pass the ARG.
# `gcloud builds submit` takes `--pack` or just directory.
# If using Dockerfile, we can pass args via `--build-arg` FLAG TO THE BUILD COMMAND?
# No, `gcloud builds submit` doesn't pass build-args to `docker build` easily without a config.

# ALTERNATIVE: Use a custom cloudbuild.yaml on the fly?
# Or clearer: Just use standard `gcloud builds submit` and rely on ENV var runtime?
# React apps need env vars AT BUILD TIME.
# Fix: Create a cloudbuild.yaml to properly pass the ARG.

cat <<EOF > frontend-cloudbuild.yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: [ 'build', '-t', 'gcr.io/$PROJECT_ID/civicsense-frontend', '--build-arg', 'VITE_API_URL=$BACKEND_URL', '.' ]
images:
- 'gcr.io/$PROJECT_ID/civicsense-frontend'
EOF

gcloud builds submit --config frontend-cloudbuild.yaml ./services/websocket/frontend
rm frontend-cloudbuild.yaml

gcloud run deploy civicsense-frontend \
    --image gcr.io/$PROJECT_ID/civicsense-frontend \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated

echo ""
echo "========================================================"
echo "🎉 Deployment Complete!"
echo "Backend:  $BACKEND_URL"
echo "Frontend: $(gcloud run services describe civicsense-frontend --region $REGION --format 'value(status.url)')"
echo "========================================================"
