# CivicSense Infrastructure - Root Configuration

# MongoDB Atlas Module
module "mongodb" {
  source = "./modules/mongodb"

  mongodbatlas_org_id        = var.mongodbatlas_org_id
  mongodbatlas_public_key    = var.mongodbatlas_public_key
  mongodbatlas_private_key   = var.mongodbatlas_private_key
  mongodbatlas_cloud_provider = var.mongodbatlas_cloud_provider
  mongodbatlas_cloud_region  = var.mongodbatlas_cloud_region
  mongodbatlas_project       = "CivicSense"
  mongodbatlas_cluster       = var.mongodb_cluster
  mongodbatlas_database      = var.mongodb_database
  mongodbatlas_collection    = var.mongodb_collection
  unique_id                  = var.unique_id
}

# GCP Module
module "gcp" {
  source = "./modules/gcp"

  gcp_region     = var.gcp_region
  gcp_project_id = var.gcp_project_id
  unique_id      = var.unique_id
}

# Confluent Cloud Module
module "confluent" {
  source = "./modules/confluent-cloud-cluster"

  confluent_cloud_region          = var.confluent_cloud_region
  confluent_cloud_service_provider = var.confluent_cloud_service_provider
  env_display_id_postfix          = var.unique_id
  
  confluent_cloud_environment = {
    name = "civicsense"
  }

  create_table_sql_files = toset([
    for f in fileset("${path.module}/statements/create-tables", "*.sql") : 
    "${path.module}/statements/create-tables/${f}"
  ])
  create_model_sql_files = toset([
    for f in fileset("${path.module}/statements/create-models", "*.sql") : 
    "${path.module}/statements/create-models/${f}"
  ])
  insert_data_sql_files  = toset([
    for f in fileset("${path.module}/statements/insert", "*.sql") : 
    "${path.module}/statements/insert/${f}"
  ])

  mongodb_host     = module.mongodb.host
  mongodb_user     = module.mongodb.connection_user
  mongodb_password = module.mongodb.connection_password

  mongodbatlas_database   = var.mongodb_database
  mongodbatlas_collection = var.mongodb_collection

  gcp_region                 = var.gcp_region
  gcp_project_id             = var.gcp_project_id
  gcp_gemini_api_key         = var.gcp_gemini_api_key
  gcp_service_account_email  = module.gcp.gcp_service_account_email
  gcp_service_account_key_file = module.gcp.gcp_service_account_key_file
  gcp_bucket_name            = module.gcp.gcs_bucket_name
  gcs_bucket_d               = module.gcp.gcs_bucket_id

  depends_on = [
    module.mongodb,
    module.gcp
  ]
}

