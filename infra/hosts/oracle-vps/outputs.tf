output "instance_ocid" {
  description = "OCI instance OCID"
  value       = oci_core_instance.nyra_a1.id
}

output "public_ip" {
  description = "Public IP assigned to the instance"
  value       = oci_core_instance.nyra_a1.public_ip
}

output "availability_domain" {
  description = "Availability domain used for the instance"
  value       = oci_core_instance.nyra_a1.availability_domain
}

output "shape" {
  description = "Compute shape"
  value       = oci_core_instance.nyra_a1.shape
}

output "ocpu" {
  description = "Configured OCPU"
  value       = var.ocpu
}

output "memory_gb" {
  description = "Configured memory in GB"
  value       = var.memory_gb
}
