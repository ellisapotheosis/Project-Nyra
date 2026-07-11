provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

locals {
  selected_ad = var.availability_domain != "" ? var.availability_domain : data.oci_identity_availability_domains.ads.availability_domains[0].name
}

data "oci_core_images" "ubuntu_arm" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = var.ubuntu_version
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
  state                    = "AVAILABLE"
}

locals {
  ubuntu_arm_image_id = [
    for image in data.oci_core_images.ubuntu_arm.images : image.id
    if strcontains(lower(image.display_name), "aarch64")
  ][0]
}

resource "oci_core_vcn" "nyra_vcn" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = [var.vcn_cidr]
  display_name   = "nyra-oracle-vcn"
  dns_label      = "nyravcn"
}

resource "oci_core_internet_gateway" "nyra_igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.nyra_vcn.id
  display_name   = "nyra-oracle-igw"
  enabled        = true
}

resource "oci_core_route_table" "nyra_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.nyra_vcn.id
  display_name   = "nyra-oracle-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.nyra_igw.id
  }
}

resource "oci_core_network_security_group" "nyra_nsg" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.nyra_vcn.id
  display_name   = "nyra-oracle-nsg"
}

resource "oci_core_network_security_group_security_rule" "ssh_ingress" {
  network_security_group_id = oci_core_network_security_group.nyra_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = "0.0.0.0/0"
  source_type               = "CIDR_BLOCK"

  tcp_options {
    destination_port_range {
      min = 22
      max = 22
    }
  }
}

resource "oci_core_network_security_group_security_rule" "egress_all" {
  network_security_group_id = oci_core_network_security_group.nyra_nsg.id
  direction                 = "EGRESS"
  protocol                  = "all"
  destination               = "0.0.0.0/0"
  destination_type          = "CIDR_BLOCK"
}

resource "oci_core_subnet" "nyra_subnet" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.nyra_vcn.id
  cidr_block                 = var.subnet_cidr
  display_name               = "nyra-oracle-public-subnet"
  dns_label                  = "nyrapub"
  route_table_id             = oci_core_route_table.nyra_rt.id
  prohibit_public_ip_on_vnic = false
}

resource "oci_core_instance" "nyra_a1" {
  availability_domain = local.selected_ad
  compartment_id      = var.compartment_ocid
  display_name        = var.instance_name
  shape               = var.shape

  shape_config {
    ocpus         = var.ocpu
    memory_in_gbs = var.memory_gb
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.nyra_subnet.id
    assign_public_ip = true
    nsg_ids          = [oci_core_network_security_group.nyra_nsg.id]
    display_name     = "nyra-oracle-vnic"
  }

  source_details {
    source_type             = "image"
    source_id               = local.ubuntu_arm_image_id
    boot_volume_size_in_gbs = var.boot_volume_size_gb
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(file("${path.module}/cloud-init.sh.tftpl"))
  }
}
