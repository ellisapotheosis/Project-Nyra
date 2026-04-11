variable "tenancy_ocid" {
  description = "OCI tenancy OCID"
  type        = string
}

variable "user_ocid" {
  description = "OCI user OCID"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint for OCI API key"
  type        = string
}

variable "private_key_path" {
  description = "Path to OCI API private key PEM file"
  type        = string
}

variable "region" {
  description = "OCI region identifier (example: us-ashburn-1)"
  type        = string
}

variable "compartment_ocid" {
  description = "Compartment OCID where resources are created"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key content that will be injected into the instance"
  type        = string
  sensitive   = true
}

variable "instance_name" {
  description = "Compute instance display name"
  type        = string
  default     = "nyra-oracle-a1"
}

variable "availability_domain" {
  description = "Optional availability domain name (for example: Uocm:US-ASHBURN-AD-1). Leave empty to use first AD."
  type        = string
  default     = ""
}

variable "shape" {
  description = "OCI shape"
  type        = string
  default     = "VM.Standard.A1.Flex"
}

variable "ocpu" {
  description = "Number of OCPUs for flex shape"
  type        = number
  default     = 4
}

variable "memory_gb" {
  description = "Memory in GB for flex shape"
  type        = number
  default     = 24
}

variable "boot_volume_size_gb" {
  description = "Boot volume size in GB"
  type        = number
  default     = 100
}

variable "ubuntu_version" {
  description = "Ubuntu image major version to use"
  type        = string
  default     = "24.04"

  validation {
    condition     = contains(["22.04", "24.04"], var.ubuntu_version)
    error_message = "ubuntu_version must be one of: 22.04, 24.04"
  }
}

variable "vcn_cidr" {
  description = "VCN CIDR block"
  type        = string
  default     = "10.50.0.0/16"
}

variable "subnet_cidr" {
  description = "Public subnet CIDR block"
  type        = string
  default     = "10.50.10.0/24"
}
