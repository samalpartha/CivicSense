#!/usr/bin/env bash

set -eo pipefail

echo "🚀 CivicSense Quick Deployment"
echo "================================"
echo ""

# Navigate to infrastructure directory
cd "$(dirname "$0")/infrastructure"

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo "Creating terraform.tfvars from credentials..."
    cat > terraform.tfvars << 'EOF'
# Unique ID
unique_id = "civicsense704"

# Confluent Cloud
confluent_cloud_api_key = "YOUR_CC_API_KEY"
confluent_cloud_api_secret = "YOUR_CC_API_SECRET"
confluent_cloud_region = "us-central1"
confluent_cloud_service_provider = "GCP"

# MongoDB Atlas
mongodbatlas_org_id = "YOUR_ATLAS_ORG_ID"
mongodbatlas_public_key = "YOUR_ATLAS_PUBLIC_KEY"
mongodbatlas_private_key = "YOUR_ATLAS_PRIVATE_KEY"
mongodbatlas_cloud_provider = "GCP"
mongodbatlas_cloud_region = "CENTRAL_US"
mongodb_cluster = "Cluster0"
mongodb_database = "civicsense"
mongodb_collection = "civic_context"

# Google Cloud
gcp_account = "YOUR_GCP_EMAIL"
gcp_project_id = "YOUR_GCP_PROJECT_ID"
gcp_region = "us-central1"
gcp_gemini_api_key = "YOUR_GEMINI_API_KEY"

# Architecture
architecture = "x86_64"
EOF
    echo "✅ Created terraform.tfvars TEMPLATE (Please edit with real credentials)"
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform not found. Installing via Homebrew..."
    brew install terraform
fi

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
    echo "📦 Initializing Terraform..."
    terraform init
fi

# Authenticate with GCP
echo ""
echo "🔐 Authenticating with Google Cloud..."
echo "A browser window will open for authentication."
read -p "Press Enter to continue..."
gcloud auth application-default login

# Plan
echo ""
echo "📋 Planning infrastructure..."
terraform plan -out=tfplan

# Confirm
echo ""
echo "⚠️  Ready to deploy infrastructure. This will create:"
echo "   - Kafka cluster on Confluent Cloud"
echo "   - Flink compute pool"
echo "   - MongoDB Atlas project"
echo "   - GCP service account and storage"
echo ""
read -p "Continue with deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Apply
echo ""
echo "🚀 Deploying infrastructure..."
terraform apply tfplan

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Getting outputs..."
terraform output

echo ""
echo "🎯 Next steps:"
echo "1. Run: terraform output -raw bootstrap_servers"
echo "2. Run: terraform output -raw clients_kafka_api_key"
echo "3. Run: terraform output -raw clients_kafka_api_secret"
echo "4. Update services/backend/.env with these values"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for complete instructions"
