#!/usr/bin/env python3
import json
import os
import re

# Paths on mounted X: drive
exports_dir = "/mnt/x/INFISICAL_AUDIT/infisical-exports"
dev_in = os.path.join(exports_dir, "shared-dev.json")
prod_in = os.path.join(exports_dir, "shared-prod.json")

dev_out_json = os.path.join(exports_dir, "shared-dev-clean.json")
prod_out_json = os.path.join(exports_dir, "shared-prod-clean.json")

dev_out_env = os.path.join(exports_dir, "shared-dev-clean.env")
prod_out_env = os.path.join(exports_dir, "shared-prod-clean.env")

# Replacements dictionary (ordered from most specific to least specific)
replacements = [
    # 1. Ports and exact URLs
    (r"http://worker-rtx3060\.trex-fiordland\.ts.net:4000/v1", "https://worker-rtx3060.projectnyra.com/v1"),
    (r"http://worker-rtx3090ti\.trex-fiordland\.ts.net:4000/v1", "https://worker-rtx3090ti.projectnyra.com/v1"),
    (r"http://worker-rtx5090\.trex-fiordland\.ts.net:4000/v1", "https://worker-rtx5090.projectnyra.com/v1"),
    (r"https://oracle\.trex-fiordland\.ts.net:5678/?", "https://n8n.projectnyra.com"),
    (r"http://oracle-vps\.trex-fiordland\.ts.net:4000/?", "https://oracle-vps.projectnyra.com"),
    (r"http://oracle-vps\.trex-fiordland\.ts.net:6000/?", "https://nexus.projectnyra.com"),
    (r"http://orchestrator\.trex-fiordland\.ts.net:8080/v1", "https://orchestrator.projectnyra.com/v1"),
    (r"https://orchestrator\.trex-fiordland\.ts.net:9443/?", "https://portainer.projectnyra.com"),
    (r"http://oracle\.trex-fiordland\.ts.net:3003/?", "https://grafana-oracle.projectnyra.com"),
    
    # 2. Domains and hostnames
    (r"git\.oracle\.trex-fiordland\.ts.net", "gitea.projectnyra.com"),
    (r"oracle-vps\.trex-fiordland\.ts.net", "oracle-vps.projectnyra.com"),
    (r"orchestrator\.trex-fiordland\.ts.net", "orchestrator.projectnyra.com"),
    (r"worker-rtx3060\.trex-fiordland\.ts.net", "worker-rtx3060.projectnyra.com"),
    (r"worker-rtx3090ti\.trex-fiordland\.ts.net", "worker-rtx3090ti.projectnyra.com"),
    (r"worker-rtx5090\.trex-fiordland\.ts.net", "worker-rtx5090.projectnyra.com"),
    (r"oracle\.trex-fiordland\.ts.net", "oracle-vps.projectnyra.com"),
    
    # 3. Base domain suffixes
    (r"\.trex-fiordland\.ts.net", ".projectnyra.com")
]

def clean_value(val):
    if not isinstance(val, str):
        return val
    new_val = val
    for pattern, repl in replacements:
        new_val = re.sub(pattern, repl, new_val, flags=re.IGNORECASE)
    return new_val

def process_file(in_path, out_json, out_env):
    if not os.path.exists(in_path):
        print(f"⚠️ Warning: {in_path} does not exist. Skipping.")
        return
    
    with open(in_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cleaned_data = []
    env_lines = []
    
    for item in data:
        # Clone secret dictionary
        new_item = dict(item)
        old_val = new_item.get("value", "")
        new_val = clean_value(old_val)
        new_item["value"] = new_val
        cleaned_data.append(new_item)
        
        # Save key/value to env-formatted line
        key = new_item.get("key", "")
        if key:
            # Escape double quotes inside value
            escaped_val = str(new_val).replace('"', '\\"')
            env_lines.append(f'{key}="{escaped_val}"')
            
    # Write cleaned JSON back
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
        
    # Write cleaned ENV file
    with open(out_env, 'w', encoding='utf-8') as f:
        f.write("\n".join(sorted(env_lines)) + "\n")
        
    print(f"✅ Successfully cleaned {len(cleaned_data)} secrets from {os.path.basename(in_path)}!")
    print(f"   - JSON saved to: {out_json}")
    print(f"   - ENV saved to: {out_env}")

if __name__ == "__main__":
    print("🚀 Running Infisical secrets cleaner and port-remover...")
    process_file(dev_in, dev_out_json, dev_out_env)
    process_file(prod_in, prod_out_json, prod_out_env)
    print("✨ Clean complete!")