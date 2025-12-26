# CivicSense Infrastructure Outputs

# Confluent Cloud Outputs
output "bootstrap_servers" {
  description = "Kafka bootstrap servers"
  value       = module.confluent.bootstrap_servers
}

output "clients_kafka_api_key" {
  description = "Kafka API key for client applications"
  value       = module.confluent.clients_kafka_api_key.id
  sensitive   = true
}

output "clients_kafka_api_secret" {
  description = "Kafka API secret for client applications"
  value       = module.confluent.clients_kafka_api_key.secret
  sensitive   = true
}

output "clients_schema_registry_api_key" {
  description = "Schema Registry API key"
  value       = module.confluent.clients_schema_registry_api_key.id
  sensitive   = true
}

output "clients_schema_registry_api_secret" {
  description = "Schema Registry API secret"
  value       = module.confluent.clients_schema_registry_api_key.secret
  sensitive   = true
}

output "schema_registry_url" {
  description = "Schema Registry URL"
  value       = module.confluent.schema_registry_url
}

output "flink_rest_endpoint" {
  description = "Flink REST endpoint"
  value       = module.confluent.flink_rest_endpoint
}

output "flink_environment_id" {
  description = "Flink environment ID"
  value       = module.confluent.flink_environment_id
}

output "organization_id" {
  description = "Confluent Cloud Organization ID"
  value       = module.confluent.organization_id
}

# MongoDB Atlas Outputs
output "mongodb_host" {
  description = "MongoDB Atlas host"
  value       = module.mongodb.host
}

output "mongodb_db_user" {
  description = "MongoDB database user"
  value       = module.mongodb.connection_user
  sensitive   = true
}

output "mongodb_db_password" {
  description = "MongoDB database password"
  value       = module.mongodb.connection_password
  sensitive   = true
}

output "mongodb_project_id" {
  description = "MongoDB Atlas Project ID"
  value       = module.mongodb.project_id
}

output "mongodb_cluster_name" {
  description = "MongoDB Atlas Cluster name"
  value       = module.mongodb.cluster
}

output "mongodb_database" {
  description = "MongoDB database name"
  value       = module.mongodb.database
}

output "mongodb_collection" {
  description = "MongoDB collection name"
  value       = module.mongodb.collection
}

# GCP Outputs
output "gcp_service_account_email" {
  description = "GCP Service Account email"
  value       = module.gcp.gcp_service_account_email
}

output "gcp_storage_bucket_name" {
  description = "GCS bucket name"
  value       = module.gcp.gcs_bucket_name
}

output "gcp_service_account_key_file" {
  description = "Path to GCP service account key file"
  value       = module.gcp.gcp_service_account_key_file
  sensitive   = true
}

