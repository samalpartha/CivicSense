# CivicSense Infrastructure Variables

# Unique identifier for this deployment
variable "unique_id" {
  description = "Unique identifier for this deployment"
  type        = string
}

# Confluent Cloud Variables
variable "confluent_cloud_api_key" {
  description = "Confluent Cloud API Key for cloud management"
  type        = string
  sensitive   = true
}

variable "confluent_cloud_api_secret" {
  description = "Confluent Cloud API Secret"
  type        = string
  sensitive   = true
}

variable "confluent_cloud_region" {
  description = "The region for Confluent Cloud cluster"
  type        = string
  default     = "us-central1"
}

variable "confluent_cloud_service_provider" {
  description = "The cloud service provider for Confluent Cloud"
  type        = string
  default     = "GCP"
}

# MongoDB Atlas Variables
variable "mongodbatlas_org_id" {
  description = "MongoDB Atlas Organization ID"
  type        = string
}

variable "mongodbatlas_public_key" {
  description = "MongoDB Atlas Public API Key"
  type        = string
  sensitive   = true
}

variable "mongodbatlas_private_key" {
  description = "MongoDB Atlas Private API Key"
  type        = string
  sensitive   = true
}

variable "mongodbatlas_cloud_provider" {
  description = "MongoDB Atlas cloud provider"
  type        = string
  default     = "GCP"
}

variable "mongodbatlas_cloud_region" {
  description = "MongoDB Atlas cloud region"
  type        = string
  default     = "CENTRAL_US"
}

variable "mongodb_cluster" {
  description = "MongoDB cluster name"
  type        = string
  default     = "Cluster0"
}

variable "mongodb_database" {
  description = "MongoDB database name"
  type        = string
  default     = "civicsense"
}

variable "mongodb_collection" {
  description = "MongoDB collection name"
  type        = string
  default     = "civic_context"
}

# Google Cloud Variables
variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "gcp_project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "gcp_account" {
  description = "GCP Account email"
  type        = string
}

variable "gcp_gemini_api_key" {
  description = "Google Gemini API Key"
  type        = string
  sensitive   = true
}

# Optional Variables
variable "architecture" {
  description = "System architecture (x86_64 or arm64)"
  type        = string
  default     = "x86_64"
}


