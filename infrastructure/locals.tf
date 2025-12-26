# Local values for the CivicSense infrastructure

locals {
  # Normalized unique ID
  unique_id_lower = lower(var.unique_id)
  
  # Common tags
  common_tags = {
    Project     = "CivicSense"
    Environment = "hackathon"
    ManagedBy   = "Terraform"
  }
  
  # MongoDB connection string (for backend .env)
  mongodb_connection_string = "mongodb+srv://${module.mongodb.connection_user}:${module.mongodb.connection_password}@${module.mongodb.host}/${var.mongodb_database}?retryWrites=true&w=majority"
}


