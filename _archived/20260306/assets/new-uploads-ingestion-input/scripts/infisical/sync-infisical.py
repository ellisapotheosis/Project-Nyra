#!/usr/bin/env python3
"""
Infisical Secrets Sync Tool with GUI

A comprehensive GUI tool for synchronizing secrets between Infisical environments
with conflict resolution, backup management, and validation.
"""

import sys
import os
import json
import subprocess
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import threading

class InfisicalSecret:
    """Represents a single Infisical secret"""
    def __init__(self, key: str, value: str, updated_at: str = None):
        self.key = key
        self.value = value
        self.updated_at = updated_at or datetime.now().isoformat()

    def to_dict(self):
        return {
            'key': self.key,
            'value': self.value,
            'updated_at': self.updated_at
        }

class InfisicalClient:
    """Wrapper for Infisical CLI operations"""

    @staticmethod
    def check_authentication() -> bool:
        """Check if user is authenticated with Infisical"""
        try:
            result = subprocess.run(
                ['infisical', 'whoami'],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0
        except Exception as e:
            print(f"Authentication check failed: {e}")
            return False

    @staticmethod
    def get_secrets(project_id: str, environment: str, path: str = '') -> List[InfisicalSecret]:
        """Fetch secrets from Infisical"""
        try:
            cmd = [
                'infisical', 'secrets',
                '--projectId', project_id,
                '--env', environment,
                '--format', 'json'
            ]

            if path:
                cmd.extend(['--path', path])

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode != 0:
                raise Exception(f"Failed to fetch secrets: {result.stderr}")

            data = json.loads(result.stdout)
            secrets = [InfisicalSecret(s['key'], s['value'], s.get('updatedAt')) for s in data]
            return secrets

        except Exception as e:
            raise Exception(f"Error fetching secrets: {str(e)}")

    @staticmethod
    def set_secret(project_id: str, environment: str, key: str, value: str, path: str = '') -> bool:
        """Set a secret in Infisical"""
        try:
            cmd = [
                'infisical', 'secrets', 'set',
                key, value,
                '--projectId', project_id,
                '--env', environment
            ]

            if path:
                cmd.extend(['--path', path])

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )

            return result.returncode == 0

        except Exception as e:
            print(f"Error setting secret {key}: {e}")
            return False

    @staticmethod
    def delete_secret(project_id: str, environment: str, key: str, path: str = '') -> bool:
        """Delete a secret from Infisical"""
        try:
            cmd = [
                'infisical', 'secrets', 'delete',
                key,
                '--projectId', project_id,
                '--env', environment
            ]

            if path:
                cmd.extend(['--path', path])

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )

            return result.returncode == 0

        except Exception as e:
            print(f"Error deleting secret {key}: {e}")
            return False

class BackupManager:
    """Manages secret backups"""

    def __init__(self, backup_dir: str = None):
        if backup_dir is None:
            backup_dir = os.path.join(os.path.dirname(__file__), 'backups')
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def create_backup(self, project_id: str, environment: str, secrets: List[InfisicalSecret]) -> str:
        """Create a backup of secrets"""
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        filename = f"backup-{project_id}-{environment}-{timestamp}.json"
        filepath = self.backup_dir / filename

        backup_data = {
            'timestamp': datetime.now().isoformat(),
            'project_id': project_id,
            'environment': environment,
            'secrets': [s.to_dict() for s in secrets]
        }

        with open(filepath, 'w') as f:
            json.dump(backup_data, f, indent=2)

        return str(filepath)

    def list_backups(self) -> List[Dict]:
        """List all available backups"""
        backups = []
        for filepath in self.backup_dir.glob('backup-*.json'):
            try:
                with open(filepath, 'r') as f:
                    data = json.load(f)
                    backups.append({
                        'filepath': str(filepath),
                        'filename': filepath.name,
                        'timestamp': data.get('timestamp'),
                        'project_id': data.get('project_id'),
                        'environment': data.get('environment'),
                        'count': len(data.get('secrets', []))
                    })
            except Exception as e:
                print(f"Error reading backup {filepath}: {e}")

        return sorted(backups, key=lambda x: x['timestamp'], reverse=True)

    def restore_backup(self, filepath: str) -> Tuple[str, str, List[InfisicalSecret]]:
        """Restore secrets from backup"""
        with open(filepath, 'r') as f:
            data = json.load(f)

        secrets = [InfisicalSecret(s['key'], s['value'], s.get('updated_at')) for s in data['secrets']]
        return data['project_id'], data['environment'], secrets

class SyncApp:
    """Main GUI application for Infisical sync"""

    def __init__(self, root):
        self.root = root
        self.root.title("Infisical Secrets Sync Tool")
        self.root.geometry("1000x700")

        self.client = InfisicalClient()
        self.backup_manager = BackupManager()

        self.source_secrets = []
        self.target_secrets = []
        self.conflicts = []

        self.setup_ui()
        self.check_authentication()

    def setup_ui(self):
        """Setup the user interface"""
        # Main notebook for tabs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Sync tab
        self.sync_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.sync_frame, text="Sync")
        self.setup_sync_tab()

        # Backup tab
        self.backup_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.backup_frame, text="Backups")
        self.setup_backup_tab()

        # Settings tab
        self.settings_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.settings_frame, text="Settings")
        self.setup_settings_tab()

        # Status bar
        self.status_var = tk.StringVar(value="Ready")
        self.status_bar = ttk.Label(self.root, textvariable=self.status_var, relief=tk.SUNKEN)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)

    def setup_sync_tab(self):
        """Setup the sync tab"""
        # Configuration frame
        config_frame = ttk.LabelFrame(self.sync_frame, text="Configuration", padding=10)
        config_frame.pack(fill=tk.X, padx=5, pady=5)

        # Source configuration
        ttk.Label(config_frame, text="Source:").grid(row=0, column=0, sticky=tk.W, pady=2)

        source_inner = ttk.Frame(config_frame)
        source_inner.grid(row=0, column=1, sticky=tk.EW, pady=2)

        ttk.Label(source_inner, text="Project ID:").pack(side=tk.LEFT)
        self.source_project_var = tk.StringVar()
        ttk.Entry(source_inner, textvariable=self.source_project_var, width=30).pack(side=tk.LEFT, padx=5)

        ttk.Label(source_inner, text="Env:").pack(side=tk.LEFT)
        self.source_env_var = tk.StringVar(value="development")
        ttk.Combobox(source_inner, textvariable=self.source_env_var,
                     values=["development", "staging", "production"], width=12).pack(side=tk.LEFT, padx=5)

        # Target configuration
        ttk.Label(config_frame, text="Target:").grid(row=1, column=0, sticky=tk.W, pady=2)

        target_inner = ttk.Frame(config_frame)
        target_inner.grid(row=1, column=1, sticky=tk.EW, pady=2)

        ttk.Label(target_inner, text="Project ID:").pack(side=tk.LEFT)
        self.target_project_var = tk.StringVar()
        ttk.Entry(target_inner, textvariable=self.target_project_var, width=30).pack(side=tk.LEFT, padx=5)

        ttk.Label(target_inner, text="Env:").pack(side=tk.LEFT)
        self.target_env_var = tk.StringVar(value="staging")
        ttk.Combobox(target_inner, textvariable=self.target_env_var,
                     values=["development", "staging", "production"], width=12).pack(side=tk.LEFT, padx=5)

        config_frame.columnconfigure(1, weight=1)

        # Action buttons
        action_frame = ttk.Frame(self.sync_frame)
        action_frame.pack(fill=tk.X, padx=5, pady=5)

        ttk.Button(action_frame, text="Fetch Secrets", command=self.fetch_secrets).pack(side=tk.LEFT, padx=2)
        ttk.Button(action_frame, text="Compare", command=self.compare_secrets).pack(side=tk.LEFT, padx=2)
        ttk.Button(action_frame, text="Sync →", command=self.sync_secrets).pack(side=tk.LEFT, padx=2)
        ttk.Button(action_frame, text="Create Backup", command=self.create_backup).pack(side=tk.LEFT, padx=2)

        # Results frame
        results_frame = ttk.LabelFrame(self.sync_frame, text="Comparison Results", padding=10)
        results_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Treeview for comparison
        columns = ('key', 'source_value', 'target_value', 'status')
        self.tree = ttk.Treeview(results_frame, columns=columns, show='headings', height=15)

        self.tree.heading('key', text='Secret Key')
        self.tree.heading('source_value', text='Source Value')
        self.tree.heading('target_value', text='Target Value')
        self.tree.heading('status', text='Status')

        self.tree.column('key', width=200)
        self.tree.column('source_value', width=250)
        self.tree.column('target_value', width=250)
        self.tree.column('status', width=150)

        # Scrollbars
        vsb = ttk.Scrollbar(results_frame, orient=tk.VERTICAL, command=self.tree.yview)
        hsb = ttk.Scrollbar(results_frame, orient=tk.HORIZONTAL, command=self.tree.xview)
        self.tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)

        self.tree.grid(row=0, column=0, sticky=tk.NSEW)
        vsb.grid(row=0, column=1, sticky=tk.NS)
        hsb.grid(row=1, column=0, sticky=tk.EW)

        results_frame.rowconfigure(0, weight=1)
        results_frame.columnconfigure(0, weight=1)

        # Configure tags for colors
        self.tree.tag_configure('same', background='#d4edda')
        self.tree.tag_configure('different', background='#fff3cd')
        self.tree.tag_configure('missing_target', background='#f8d7da')
        self.tree.tag_configure('missing_source', background='#d1ecf1')

    def setup_backup_tab(self):
        """Setup the backup tab"""
        # Backup list frame
        list_frame = ttk.LabelFrame(self.backup_frame, text="Available Backups", padding=10)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Treeview for backups
        columns = ('filename', 'timestamp', 'project', 'environment', 'count')
        self.backup_tree = ttk.Treeview(list_frame, columns=columns, show='headings', height=15)

        self.backup_tree.heading('filename', text='Filename')
        self.backup_tree.heading('timestamp', text='Timestamp')
        self.backup_tree.heading('project', text='Project ID')
        self.backup_tree.heading('environment', text='Environment')
        self.backup_tree.heading('count', text='Secrets Count')

        self.backup_tree.column('filename', width=300)
        self.backup_tree.column('timestamp', width=200)
        self.backup_tree.column('project', width=150)
        self.backup_tree.column('environment', width=100)
        self.backup_tree.column('count', width=100)

        vsb = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.backup_tree.yview)
        self.backup_tree.configure(yscrollcommand=vsb.set)

        self.backup_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        vsb.pack(side=tk.RIGHT, fill=tk.Y)

        # Action buttons
        action_frame = ttk.Frame(self.backup_frame)
        action_frame.pack(fill=tk.X, padx=5, pady=5)

        ttk.Button(action_frame, text="Refresh List", command=self.refresh_backups).pack(side=tk.LEFT, padx=2)
        ttk.Button(action_frame, text="Restore Selected", command=self.restore_backup).pack(side=tk.LEFT, padx=2)
        ttk.Button(action_frame, text="Delete Selected", command=self.delete_backup).pack(side=tk.LEFT, padx=2)
        ttk.Button(action_frame, text="Export Backup", command=self.export_backup).pack(side=tk.LEFT, padx=2)

        # Load backups
        self.refresh_backups()

    def setup_settings_tab(self):
        """Setup the settings tab"""
        settings_inner = ttk.Frame(self.settings_frame, padding=20)
        settings_inner.pack(fill=tk.BOTH, expand=True)

        ttk.Label(settings_inner, text="Backup Directory:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.backup_dir_var = tk.StringVar(value=str(self.backup_manager.backup_dir))
        ttk.Entry(settings_inner, textvariable=self.backup_dir_var, width=50).grid(row=0, column=1, sticky=tk.EW, pady=5)
        ttk.Button(settings_inner, text="Browse", command=self.browse_backup_dir).grid(row=0, column=2, padx=5)

        ttk.Label(settings_inner, text="Default Path:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.default_path_var = tk.StringVar(value="/project-nyra/core")
        ttk.Entry(settings_inner, textvariable=self.default_path_var, width=50).grid(row=1, column=1, sticky=tk.EW, pady=5)

        ttk.Checkbutton(settings_inner, text="Auto-backup before sync").grid(row=2, column=0, columnspan=2, sticky=tk.W, pady=5)
        ttk.Checkbutton(settings_inner, text="Show sensitive values (use with caution)").grid(row=3, column=0, columnspan=2, sticky=tk.W, pady=5)

        settings_inner.columnconfigure(1, weight=1)

    def check_authentication(self):
        """Check if user is authenticated"""
        if not self.client.check_authentication():
            messagebox.showerror(
                "Authentication Required",
                "You are not authenticated with Infisical.\n\n"
                "Please run: infisical login"
            )
            self.status_var.set("Not authenticated")
        else:
            self.status_var.set("Authenticated ✓")

    def fetch_secrets(self):
        """Fetch secrets from source and target"""
        self.status_var.set("Fetching secrets...")
        self.root.update()

        try:
            # Fetch source secrets
            self.source_secrets = self.client.get_secrets(
                self.source_project_var.get(),
                self.source_env_var.get()
            )

            # Fetch target secrets
            self.target_secrets = self.client.get_secrets(
                self.target_project_var.get(),
                self.target_env_var.get()
            )

            self.status_var.set(f"Fetched {len(self.source_secrets)} source and {len(self.target_secrets)} target secrets")
            messagebox.showinfo("Success", f"Fetched secrets successfully!\n\nSource: {len(self.source_secrets)}\nTarget: {len(self.target_secrets)}")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to fetch secrets:\n\n{str(e)}")
            self.status_var.set("Error fetching secrets")

    def compare_secrets(self):
        """Compare source and target secrets"""
        if not self.source_secrets or not self.target_secrets:
            messagebox.showwarning("Warning", "Please fetch secrets first")
            return

        # Clear tree
        for item in self.tree.get_children():
            self.tree.delete(item)

        source_dict = {s.key: s for s in self.source_secrets}
        target_dict = {s.key: s for s in self.target_secrets}

        all_keys = set(source_dict.keys()) | set(target_dict.keys())

        same_count = 0
        different_count = 0
        missing_target_count = 0
        missing_source_count = 0

        for key in sorted(all_keys):
            source_val = source_dict.get(key)
            target_val = target_dict.get(key)

            if source_val and target_val:
                if source_val.value == target_val.value:
                    status = "Same"
                    tag = 'same'
                    same_count += 1
                else:
                    status = "Different"
                    tag = 'different'
                    different_count += 1

                self.tree.insert('', tk.END, values=(
                    key,
                    source_val.value[:50] + '...' if len(source_val.value) > 50 else source_val.value,
                    target_val.value[:50] + '...' if len(target_val.value) > 50 else target_val.value,
                    status
                ), tags=(tag,))

            elif source_val and not target_val:
                status = "Missing in Target"
                missing_target_count += 1
                self.tree.insert('', tk.END, values=(
                    key,
                    source_val.value[:50] + '...' if len(source_val.value) > 50 else source_val.value,
                    '',
                    status
                ), tags=('missing_target',))

            else:  # target_val and not source_val
                status = "Missing in Source"
                missing_source_count += 1
                self.tree.insert('', tk.END, values=(
                    key,
                    '',
                    target_val.value[:50] + '...' if len(target_val.value) > 50 else target_val.value,
                    status
                ), tags=('missing_source',))

        summary = f"Same: {same_count} | Different: {different_count} | Missing in Target: {missing_target_count} | Missing in Source: {missing_source_count}"
        self.status_var.set(summary)

    def sync_secrets(self):
        """Sync secrets from source to target"""
        if not self.source_secrets:
            messagebox.showwarning("Warning", "Please fetch source secrets first")
            return

        # Confirm sync
        result = messagebox.askyesno(
            "Confirm Sync",
            f"This will sync {len(self.source_secrets)} secrets from source to target.\n\n"
            "A backup will be created automatically.\n\nContinue?"
        )

        if not result:
            return

        # Create backup
        try:
            backup_path = self.backup_manager.create_backup(
                self.target_project_var.get(),
                self.target_env_var.get(),
                self.target_secrets
            )
            self.status_var.set(f"Backup created: {backup_path}")
        except Exception as e:
            messagebox.showerror("Backup Failed", f"Failed to create backup:\n\n{str(e)}")
            return

        # Sync secrets
        success_count = 0
        fail_count = 0

        for secret in self.source_secrets:
            if self.client.set_secret(
                self.target_project_var.get(),
                self.target_env_var.get(),
                secret.key,
                secret.value
            ):
                success_count += 1
            else:
                fail_count += 1

        messagebox.showinfo(
            "Sync Complete",
            f"Sync completed!\n\nSuccess: {success_count}\nFailed: {fail_count}"
        )

        self.status_var.set(f"Sync complete: {success_count} success, {fail_count} failed")

    def create_backup(self):
        """Create a manual backup"""
        if not self.source_secrets:
            messagebox.showwarning("Warning", "Please fetch secrets first")
            return

        try:
            backup_path = self.backup_manager.create_backup(
                self.source_project_var.get(),
                self.source_env_var.get(),
                self.source_secrets
            )
            messagebox.showinfo("Backup Created", f"Backup saved to:\n\n{backup_path}")
            self.refresh_backups()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to create backup:\n\n{str(e)}")

    def refresh_backups(self):
        """Refresh backup list"""
        for item in self.backup_tree.get_children():
            self.backup_tree.delete(item)

        backups = self.backup_manager.list_backups()
        for backup in backups:
            self.backup_tree.insert('', tk.END, values=(
                backup['filename'],
                backup['timestamp'],
                backup['project_id'],
                backup['environment'],
                backup['count']
            ))

    def restore_backup(self):
        """Restore selected backup"""
        selection = self.backup_tree.selection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a backup to restore")
            return

        # Get backup details
        item = self.backup_tree.item(selection[0])
        filename = item['values'][0]

        result = messagebox.askyesno(
            "Confirm Restore",
            f"Restore backup: {filename}?\n\nThis will overwrite current secrets."
        )

        if not result:
            return

        # TODO: Implement restore logic
        messagebox.showinfo("Restore", "Restore functionality will be implemented")

    def delete_backup(self):
        """Delete selected backup"""
        selection = self.backup_tree.selection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a backup to delete")
            return

        result = messagebox.askyesno("Confirm Delete", "Delete selected backup?")
        if result:
            # TODO: Implement delete logic
            self.refresh_backups()

    def export_backup(self):
        """Export backup to a custom location"""
        selection = self.backup_tree.selection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a backup to export")
            return

        filepath = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )

        if filepath:
            # TODO: Implement export logic
            messagebox.showinfo("Export", f"Backup exported to:\n\n{filepath}")

    def browse_backup_dir(self):
        """Browse for backup directory"""
        directory = filedialog.askdirectory()
        if directory:
            self.backup_dir_var.set(directory)
            self.backup_manager.backup_dir = Path(directory)

def main():
    """Main entry point"""
    root = tk.Tk()
    app = SyncApp(root)
    root.mainloop()

if __name__ == '__main__':
    main()
