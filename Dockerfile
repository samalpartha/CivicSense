# Dockerfile for Terraform infrastructure deployment
ARG IMAGE_ARCH=x86_64

FROM hashicorp/terraform:1.6

# Install dependencies
RUN apk add --no-cache \
    bash \
    curl \
    jq \
    python3 \
    py3-pip \
    git

# Set working directory
WORKDIR /app/infrastructure

# Set entrypoint to terraform
ENTRYPOINT ["terraform"]

