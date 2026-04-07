"""
title: Unified Control Plane
author: Project Nyra
version: 1.0.0
required_open_webui_version: 0.4.8
"""

from typing import Any, Dict


class Tools:
    def unified_front(self) -> Dict[str, Any]:
        """Return Archon OS and Nexus dashboard links for single-pane navigation."""
        return {
            "title": "Nyra Unified Front",
            "archon": {
                "label": "Archon OS",
                "url": "http://archon-os:8051",
                "embed": "http://archon-os:8051",
            },
            "nexus": {
                "label": "Nexus Router Metrics",
                "url": "http://nexus:4001/mcp/metrics",
                "embed": "http://nexus:4001/",
            },
            "openmemory": {
                "label": "OpenMemory",
                "url": "http://openmemory_mcp:8081",
            },
        }
