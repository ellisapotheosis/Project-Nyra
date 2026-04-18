# Legacy compatibility Makefile for historical infra/ingest workflows.
# Canonical infra automation now lives in ../Makefile and ../../Makefile.

SHELL := /bin/bash

.PHONY: help verify-paths up down logs health build test clean reset worker-up worker-down oracle-up oracle-down

help:
	@echo "infra/ingest Makefile (compatibility shim)"
	@echo "Canonical targets are delegated to infra/Makefile."
	@echo "Examples:"
	@echo "  make -C infra/ingest up           # delegates to infra up"
	@echo "  make -C infra/ingest health       # delegates to infra health"
	@echo "  make -C infra/ingest verify-paths # validates delegated paths"

verify-paths:
	@$(MAKE) -C .. verify-paths

up down logs health build test clean reset worker-up worker-down oracle-up oracle-down: verify-paths
	@$(MAKE) -C .. $@
