#!/usr/bin/env python3
"""
Project Nyra - GitHub <-> Gitea Synchronization Service

Handles bidirectional synchronization between GitHub and Gitea repositories
with conflict resolution and automated mirroring capabilities.
"""

import os
import sys
import time
import json
import yaml
import logging
import requests
import schedule
from datetime import datetime, timezone
from flask import Flask, jsonify
from threading import Thread
from typing import Dict, List, Optional, Tuple
import git
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class GitSyncService:
    """GitHub <-> Gitea synchronization service"""

    def __init__(self, config_path: str = '/app/config.yaml'):
        """Initialize the sync service"""
        self.config = self._load_config(config_path)
        self.logger = self._setup_logging()
        self.session = self._setup_session()

        # Service state
        self.last_sync = None
        self.sync_count = 0
        self.error_count = 0
        self.status = "initializing"

        # Initialize Flask app for health checks
        self.app = Flask(__name__)
        self._setup_routes()

    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from file and environment"""
        # Default configuration
        config = {
            'sync_interval': int(os.getenv('SYNC_INTERVAL', 300)),
            'log_level': os.getenv('LOG_LEVEL', 'info'),
            'conflict_resolution': os.getenv('CONFLICT_RESOLUTION', 'gitea_wins'),
            'sync_direction': os.getenv('SYNC_DIRECTION', 'bidirectional'),
            'backup_mode': os.getenv('BACKUP_MODE', 'false').lower() == 'true',

            # API endpoints
            'source_gitea_url': os.getenv('SOURCE_GITEA_URL') or os.getenv('GITEA_URL'),
            'target_gitea_url': os.getenv('TARGET_GITEA_URL'),
            'github_api_url': 'https://api.github.com',

            # Repository settings
            'github_repo': os.getenv('GITHUB_REPO', 'ellisapotheosis/Project-Nyra'),
            'gitea_repo': os.getenv('GITEA_REPO', 'admin/Project-Nyra'),

            # Working directory
            'work_dir': '/data/repos',
        }

        # Load from file if exists
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                file_config = yaml.safe_load(f)
                config.update(file_config)

        return config

    def _setup_logging(self) -> logging.Logger:
        """Set up logging configuration"""
        log_level = getattr(logging, self.config['log_level'].upper())

        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler('/logs/sync-service.log')
            ]
        )

        return logging.getLogger('GitSyncService')

    def _setup_session(self) -> requests.Session:
        """Set up HTTP session with retry logic"""
        session = requests.Session()

        # Retry strategy
        retry_strategy = Retry(
            total=3,
            status_forcelist=[429, 500, 502, 503, 504],
            method_whitelist=["HEAD", "GET", "OPTIONS", "POST", "PUT"]
        )

        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        return session

    def _setup_routes(self):
        """Set up Flask routes for health checks"""
        @self.app.route('/health')
        def health():
            return jsonify({
                'status': self.status,
                'last_sync': self.last_sync.isoformat() if self.last_sync else None,
                'sync_count': self.sync_count,
                'error_count': self.error_count,
                'uptime': time.time() - self.start_time if hasattr(self, 'start_time') else 0
            })

        @self.app.route('/config')
        def config():
            # Return safe config (no secrets)
            safe_config = {k: v for k, v in self.config.items()
                          if not any(secret in k.lower() for secret in ['token', 'password', 'secret'])}
            return jsonify(safe_config)

        @self.app.route('/sync', methods=['POST'])
        def manual_sync():
            """Trigger manual synchronization"""
            try:
                self._perform_sync()
                return jsonify({'status': 'sync triggered'})
            except Exception as e:
                self.logger.error(f"Manual sync failed: {e}")
                return jsonify({'error': str(e)}), 500

    def _get_auth_headers(self, service: str) -> Dict[str, str]:
        """Get authentication headers for API calls"""
        if service == 'github':
            token_file = '/run/nyra-secrets/github_token'
        elif service == 'gitea_source':
            token_file = '/run/nyra-secrets/gitea_orchestrator_token'
        elif service == 'gitea_target':
            token_file = '/run/nyra-secrets/gitea_backup_token'
        else:
            token_file = '/run/nyra-secrets/gitea_admin_token'

        if os.path.exists(token_file):
            with open(token_file, 'r') as f:
                token = f.read().strip()

            if service == 'github':
                return {'Authorization': f'Bearer {token}'}
            else:
                return {'Authorization': f'token {token}'}

        return {}

    def _clone_or_update_repo(self, repo_url: str, local_path: str, branch: str = 'main') -> git.Repo:
        """Clone repository or update if exists"""
        if os.path.exists(local_path):
            repo = git.Repo(local_path)
            origin = repo.remotes.origin
            origin.fetch()
            repo.git.checkout(branch)
            origin.pull()
            self.logger.info(f"Updated repository: {local_path}")
        else:
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            repo = git.Repo.clone_from(repo_url, local_path)
            self.logger.info(f"Cloned repository: {repo_url}")

        return repo

    def _get_repo_commits(self, repo: git.Repo, since: Optional[datetime] = None) -> List[git.Commit]:
        """Get commits from repository"""
        commits = list(repo.iter_commits('main'))

        if since:
            commits = [c for c in commits if c.committed_datetime > since]

        return commits

    def _sync_github_to_gitea(self) -> Tuple[bool, str]:
        """Sync changes from GitHub to Gitea"""
        try:
            # Get latest commits from GitHub
            github_repo_path = os.path.join(self.config['work_dir'], 'github')
            github_url = f"https://github.com/{self.config['github_repo']}.git"

            github_repo = self._clone_or_update_repo(github_url, github_repo_path)

            # Get Gitea repository
            gitea_repo_path = os.path.join(self.config['work_dir'], 'gitea')
            gitea_url = f"{self.config['source_gitea_url']}/{self.config['gitea_repo']}.git"

            # Add authentication to URL
            auth_headers = self._get_auth_headers('gitea_source')
            if auth_headers:
                token = auth_headers['Authorization'].split()[-1]
                gitea_url = gitea_url.replace('://', f'://oauth2:{token}@')

            gitea_repo = self._clone_or_update_repo(gitea_url, gitea_repo_path)

            # Compare and sync
            github_commits = self._get_repo_commits(github_repo)
            gitea_commits = self._get_repo_commits(gitea_repo)

            github_hashes = {c.hexsha for c in github_commits}
            gitea_hashes = {c.hexsha for c in gitea_commits}

            new_commits = github_hashes - gitea_hashes

            if new_commits:
                self.logger.info(f"Found {len(new_commits)} new commits from GitHub")

                # Push changes to Gitea
                gitea_origin = gitea_repo.remotes.origin
                gitea_origin.push()

                return True, f"Synced {len(new_commits)} commits from GitHub to Gitea"
            else:
                return True, "No new commits to sync from GitHub"

        except Exception as e:
            error_msg = f"Error syncing GitHub to Gitea: {e}"
            self.logger.error(error_msg)
            return False, error_msg

    def _sync_gitea_to_github(self) -> Tuple[bool, str]:
        """Sync changes from Gitea to GitHub"""
        try:
            # Similar logic but reversed direction
            gitea_repo_path = os.path.join(self.config['work_dir'], 'gitea')
            gitea_url = f"{self.config['source_gitea_url']}/{self.config['gitea_repo']}.git"

            # Add authentication to URL
            auth_headers = self._get_auth_headers('gitea_source')
            if auth_headers:
                token = auth_headers['Authorization'].split()[-1]
                gitea_url = gitea_url.replace('://', f'://oauth2:{token}@')

            gitea_repo = self._clone_or_update_repo(gitea_url, gitea_repo_path)

            # Get GitHub repository
            github_repo_path = os.path.join(self.config['work_dir'], 'github')
            github_url = f"https://github.com/{self.config['github_repo']}.git"

            # Add GitHub authentication
            auth_headers = self._get_auth_headers('github')
            if auth_headers:
                token = auth_headers['Authorization'].split()[-1]
                github_url = github_url.replace('://', f'://oauth2:{token}@')

            github_repo = self._clone_or_update_repo(github_url, github_repo_path)

            # Compare and sync
            gitea_commits = self._get_repo_commits(gitea_repo)
            github_commits = self._get_repo_commits(github_repo)

            gitea_hashes = {c.hexsha for c in gitea_commits}
            github_hashes = {c.hexsha for c in github_commits}

            new_commits = gitea_hashes - github_hashes

            if new_commits:
                self.logger.info(f"Found {len(new_commits)} new commits from Gitea")

                # Push changes to GitHub
                github_origin = github_repo.remotes.origin
                github_origin.push()

                return True, f"Synced {len(new_commits)} commits from Gitea to GitHub"
            else:
                return True, "No new commits to sync from Gitea"

        except Exception as e:
            error_msg = f"Error syncing Gitea to GitHub: {e}"
            self.logger.error(error_msg)
            return False, error_msg

    def _perform_sync(self):
        """Perform synchronization based on configuration"""
        self.logger.info("Starting synchronization process")
        self.status = "syncing"

        sync_results = []

        try:
            if self.config['sync_direction'] in ['bidirectional', 'github_to_gitea']:
                success, message = self._sync_github_to_gitea()
                sync_results.append(('GitHub -> Gitea', success, message))

            if self.config['sync_direction'] in ['bidirectional', 'gitea_to_github']:
                success, message = self._sync_gitea_to_github()
                sync_results.append(('Gitea -> GitHub', success, message))

            # Update statistics
            self.last_sync = datetime.now(timezone.utc)
            self.sync_count += 1

            # Check for errors
            if any(not result[1] for result in sync_results):
                self.error_count += 1
                self.status = "error"
            else:
                self.status = "healthy"

            # Log results
            for direction, success, message in sync_results:
                if success:
                    self.logger.info(f"{direction}: {message}")
                else:
                    self.logger.error(f"{direction}: {message}")

        except Exception as e:
            self.error_count += 1
            self.status = "error"
            self.logger.error(f"Sync process failed: {e}")

    def run_scheduler(self):
        """Run the scheduled synchronization"""
        schedule.every(self.config['sync_interval']).seconds.do(self._perform_sync)

        self.logger.info(f"Starting scheduler with {self.config['sync_interval']}s interval")

        while True:
            schedule.run_pending()
            time.sleep(10)

    def run(self):
        """Start the service"""
        self.start_time = time.time()
        self.status = "starting"

        # Perform initial sync
        self._perform_sync()

        # Start scheduler in background
        scheduler_thread = Thread(target=self.run_scheduler, daemon=True)
        scheduler_thread.start()

        # Start Flask app
        self.logger.info("Starting health check server on port 8080")
        self.app.run(host='0.0.0.0', port=8080, debug=False)


def main():
    """Main entry point"""
    service = GitSyncService()
    service.run()


if __name__ == '__main__':
    main()