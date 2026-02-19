# Gitea Development Workflow Guide

This guide explains how to connect to and use the self-hosted Gitea server running on the orchestrator PC. Gitea acts as the central "source of truth" for the `project-nyra` codebase.

## 1. First-Time Server Setup (Admin Task)

The first person to access Gitea after it's launched needs to perform a one-time setup.

1.  **Access the Web UI:** Open a browser and navigate to `http://<ORCHESTRATOR_IP>:3000` (replace with the orchestrator's actual IP, which is set as `GITEA_HOST_IP` in your `.env` file).
2.  **Run the Initial Configuration:**
    *   **Database Type:** Choose **SQLite3**. This is the simplest option and is fine for this use case. The database file will be stored in a Docker volume for persistence.
    *   **Application General Settings:**
        *   **Site Title:** `Project Nyra`
        *   **Server Domain:** Use the orchestrator's IP address, e.g., `192.168.1.100`.
        *   **Gitea Base URL:** Use the full URL, e.g., `http://192.168.1.100:3000/`.
    *   **Create Admin Account:** Further down the page, create your admin user account. **Do not forget this username and password.**
3.  **Log In:** Once configured, log in with your new admin account.

## 2. Connecting Your Development PC to Gitea (For All Devs)

For **every machine** you want to develop on, you must perform these steps:

1.  **Install Git:** Make sure the `git` command-line tool is installed.
2.  **Generate SSH Key:** If you don't already have one, create a new SSH key.
    ```bash
    # Use ed25519 for modern security
    ssh-keygen -t ed25519 -C "your_email@example.com"
    ```
    Press Enter to accept the default file location and an optional passphrase.
3.  **Add SSH Key to Gitea:**
    *   Display your new public key: `cat ~/.ssh/id_ed25519.pub`
    *   Copy the entire output (starting with `ssh-ed25519...`).
    *   In the Gitea web UI, go to your user **Settings** (top right icon) -> **SSH / GPG Keys** -> **Add Key**.
    *   Paste your key into the "Content" box and give it a title (e.g., "My Laptop").
4.  **Clone the Repository via SSH:** On your dev machine, navigate to your projects folder and clone the repository **from Gitea**.
    *   First, someone (e.g., the admin) must create an empty repository named `project-nyra` in the Gitea UI.
    *   Then, everyone can clone it (use the SSH port from the `.env` file, e.g., 2222):
        ```bash
        git clone ssh://git@<ORCHESTRATOR_IP>:2222/YourGiteaUsername/project-nyra.git
        ```
    *   You are now ready to develop!

## 3. Migrating the Existing Code (Admin Task)

To get the current codebase into the new, empty Gitea repository:

1.  Navigate to your existing `project-nyra` folder on the machine where you have the latest code.
2.  Add Gitea as a new remote (use the SSH port from the `.env` file):
    ```bash
    git remote add gitea ssh://git@<ORCHESTRATOR_IP>:2222/YourGiteaUsername/project-nyra.git
    ```
3.  Push all branches and tags to Gitea:
    ```bash
    # Push all branches
    git push -u gitea --all

    # Push all tags
    git push -u gitea --tags
    ```
The Gitea server is now the main remote. Other developers should now delete their local copies and re-clone from Gitea to ensure their setup is correct.

## 4. Day-to-Day Workflow

Your daily workflow is standard `git` practice:

1.  `git pull` - Get the latest changes from the default remote branch.
2.  `...make your code changes...`
3.  `git add .`
4.  `git commit -m "A descriptive message"`
5.  `git push` - Share your work with the team.
