# Project Nyra: The Blueprint for Autonomous AI Development

This document provides a comprehensive blueprint for setting up and understanding Project Nyra, an open-source, decentralized autonomous AI ecosystem. It contains all necessary information for an AI agent (e.g., Claude, Gemini, Warp) to reconstruct the project from scratch, including architectural details, configuration files, and setup instructions.

## 1. Project Overview and Vision

### Preamble

Project Nyra is a pioneering initiative at the intersection of Artificial Intelligence, open collaboration, and decentralized intelligence. Our vision is to empower individuals and organizations by democratizing access to advanced autonomous AI capabilities, fostering innovation, and accelerating solutions to complex challenges. We believe in an AI future that is open, intelligent, and designed for the benefit of all.

### Core Principles

*   **Open Source and Community-Driven:** Project Nyra will be developed as a fully open-source initiative, encouraging global contributions and guided by its community.
*   **Decentralized Intelligence:** Our architecture promotes a decentralized approach, enabling the creation and orchestration of multiple specialized agents for resilience and scalability.
*   **Autonomous and Adaptive:** Agents are designed for autonomy, capable of independent perception, reasoning, planning, and action, adapting to dynamic environments.
*   **Ethical AI and Transparency:** We commit to responsible AI development, prioritizing ethical considerations, fairness, and accountability through transparency.
*   **Interoperability and Extensibility:** Project Nyra is a flexible framework, supporting seamless integration with various AI models, tools, and platforms, ensuring longevity.
*   **Security and Privacy by Design:** Robust security measures and privacy-preserving mechanisms are incorporated from inception to protect sensitive information.
*   **Empowerment Through AI:** Ultimately, Project Nyra seeks to unlock unprecedented opportunities for innovation and problem-solving across all domains.

### Our Vision

To build a foundational framework for a decentralized, open-source ecosystem of autonomous AI agents that can collaborate, learn, and evolve, thereby accelerating scientific discovery, fostering technological innovation, and addressing humanity's most pressing challenges.

## 2. Architectural Overview

Project Nyra leverages a modular and containerized architecture centered around the `MetaMCP` (Meta-AI Control Plane) agent, which acts as the primary orchestrator for various LLM and tool channels.

### Core Components:

*   **MetaMCP Agent:** The brain of the operation. `MetaMCP` is an autonomous AI agent responsible for coordinating tasks, selecting appropriate LLM models (e.g., Claude, Gemini), and utilizing tools (e.g., filesystem, Git, GitHub). It processes prompts, breaks down complex problems, and orchestrates the workflow.
*   **`channels.json`:** This configuration file defines the available Large Language Models (LLMs) and tools that `MetaMCP` can access and utilize. It specifies providers (Anthropic, Google, Ollama, ngrok-filesys), models, descriptions, and API key environment variable references. This allows for dynamic switching between different AI capabilities and services.
*   **`docker-compose.yml`:** Orchestrates the local development environment using Docker containers. It defines services for:
    *   **`metamcp`:** The `MetaMCP` agent itself, running within a Python environment.
    *   **`ngrok`:** Creates secure tunnels to expose local services (like `metamcp`) to the internet, allowing `ngrok-filesys` tools and potentially other external integrations to communicate.
    *   **`infisical`:** An open-source secret management platform. This service securely injects API keys and other sensitive environment variables into the `metamcp` container at runtime, keeping them out of source code.
*   **`THE-TRUTH` Directory:** This serves as the root for core project documentation and configuration.
    *   `MANIFESTO.md`: Defines the project's vision and principles.
    *   `ARCHITECTURE.md`: Details the system's design and components.
    *   `CONFIG/`: Contains runtime configuration files like `docker-compose.yml` and `channels.json`.

## 3. Detailed Setup Instructions for an AI

To set up Project Nyra, an AI agent should follow these steps precisely.

### Step 1: Prerequisites

Ensure the following are installed and configured on the host system:

*   **Docker Desktop:** For running containerized services (`docker` and `docker compose` commands should be available).
*   **Git:** For version control.
*   **API Keys:**
    *   Anthropic API Key (for Claude 3 Opus)
    *   Google API Key (for Gemini 1.5 Pro)
    *   GitHub Personal Access Token (with repo, workflow, write:packages permissions for GitHub tool)
*   **Infisical Account & Service Token:** An Infisical Cloud account is recommended for secure secret management. A **Service Token** is required for the `infisical` Docker service to fetch secrets.
*   **ngrok Account & Auth Token:** An ngrok account is required. An `NGROK_AUTHTOKEN` is needed for the ngrok Docker service to authenticate and create tunnels.

### Step 2: Project Directory Setup

Create the following directory structure:

```
C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Project-Nyra
├── THE-TRUTH
│   ├── CONFIG
│   └── (Other files will go here)
└── (Other project files/folders)
```

Specifically:
*   Create the base directory: `C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Project-Nyra`
*   Inside the base directory, create `THE-TRUTH`
*   Inside `THE-TRUTH`, create `CONFIG`

### Step 3: Create `MANIFESTO.md`

Create a file named `MANIFESTO.md` at `C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Project-Nyra\THE-TRUTH\MANIFESTO.md` with the following exact content:

```markdown
# Project Nyra: A New Era of Autonomous AI Development

## Manifesto

### Preamble

We stand at the precipice of a new frontier, where the boundless potential of Artificial Intelligence intersects with the principles of open collaboration and decentralized intelligence. Project Nyra is born from the conviction that the future of AI should not be confined to monolithic entities, but rather flourish as a collective endeavor, fostering innovation, transparency, and shared progress. We envision a world where autonomous AI agents, powered by a robust and adaptable framework, can tackle complex challenges, augment human capabilities, and contribute to a more intelligent and equitable society.

### Core Principles

1.  **Open Source and Community-Driven:** Project Nyra will be developed as a fully open-source initiative. We believe in the power of collective intelligence, encouraging contributions from researchers, developers, and enthusiasts worldwide. The project's direction will be guided by its community, ensuring inclusivity and diverse perspectives.

2.  **Decentralized Intelligence:** Our architecture promotes a decentralized approach to AI. Rather than a single, all-encompassing AI, Project Nyra will enable the creation and orchestration of multiple specialized agents, each contributing its unique expertise. This modularity fosters resilience, scalability, and adaptability.

3.  **Autonomous and Adaptive:** Agents within Project Nyra are designed for autonomy. They will possess the ability to perceive, reason, plan, and act independently, adapting to dynamic environments and learning from their experiences. This self-sufficiency is crucial for tackling real-world complexities.

4.  **Ethical AI and Transparency:** We commit to developing AI responsibly, prioritizing ethical considerations, fairness, and accountability. The open-source nature of the project will provide transparency into its mechanisms, allowing for scrutiny and continuous improvement in ethical guidelines and implementations.

5.  **Interoperability and Extensibility:** Project Nyra aims to be a flexible framework, supporting seamless integration with various AI models, tools, and platforms. Its extensible design will allow for easy incorporation of new technologies and research advancements, ensuring its longevity and relevance.

6.  **Security and Privacy by Design:** Recognizing the critical importance of data security and user privacy, Project Nyra will incorporate these principles from its inception. Agents will be designed with robust security measures and privacy-preserving mechanisms to protect sensitive information and ensure trustworthy operations.

7.  **Empowerment Through AI:** Ultimately, Project Nyra seeks to empower individuals and organizations. By democratizing access to advanced autonomous AI capabilities, we aim to unlock unprecedented opportunities for innovation, problem-solving, and human flourishing across all domains.

### Our Vision

To build a foundational framework for a decentralized, open-source ecosystem of autonomous AI agents that can collaborate, learn, and evolve, thereby accelerating scientific discovery, fostering technological innovation, and addressing humanity's most pressing challenges.

Join us in building the future of AI – a future that is open, intelligent, and designed for the benefit of all.
```

### Step 4: Create `ARCHITECTURE.md`

Create a file named `ARCHITECTURE.md` at `C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Project-Nyra\THE-TRUTH\ARCHITECTURE.md` with the following exact content:

```markdown
# Project Nyra: Core Architecture

This document details the core architectural components and their interactions within Project Nyra. The design prioritizes modularity, extensibility, security, and the orchestration of diverse AI capabilities.

## 1. Overview

Project Nyra's architecture is built around a central Meta-AI Control Plane (MetaMCP) agent that dynamically interacts with various Large Language Models (LLMs) and external tools. The entire system is designed to be highly configurable, allowing for easy integration of new AI models and functionalities. Containerization using Docker ensures consistency and ease of deployment.

## 2. Key Architectural Components

### 2.1. Meta-AI Control Plane (MetaMCP)

The MetaMCP is the orchestrator and primary intelligent agent within Project Nyra.
*   **Role:** Receives high-level goals, breaks them down into sub-tasks, plans execution, selects appropriate LLM channels and tools, and synthesizes results. It embodies the "sequential thinking" and "hypothesis verification" mechanisms.
*   **Core Logic:** Implements sophisticated reasoning, context management, and decision-making capabilities to navigate complex problem spaces.
*   **Interaction:** Communicates with LLMs for reasoning and content generation, and interacts with various tools for sensing (reading files, listing directories), acting (writing files, executing Git commands, creating GitHub resources), and interacting with external services.

### 2.2. Channels Configuration (`channels.json`)

This JSON file is the heart of MetaMCP's adaptability, defining all accessible LLM and tool channels.
*   **LLM Channels:**
    *   **Providers:** Supports integration with various LLM providers (e.g., Anthropic, Google, Ollama).
    *   **Models:** Specifies particular models (e.g., `claude-3-opus-20240229`, `gemini-1.5-pro-latest`, `llama3:70b`).
    *   **Configuration:** Includes API key environment variable references, temperature, and max tokens.
    *   **Extensibility:** New LLMs can be easily added by updating this file.
*   **Tool Channels:**
    *   **Providers:** Currently leverages `ngrok-filesys` for local filesystem, Git, and GitHub operations.
    *   **Tools:** Explicitly lists the functions available through each tool provider (e.g., `fs_list`, `git_clone`, `gh_pr_create`).
    *   **Purpose:** Enables MetaMCP to interact with its environment (read/write files, manage code repositories, interact with GitHub API) and perform actions beyond pure linguistic reasoning.
    *   **Extensibility:** New tools can be integrated by defining their channels and functions here.

### 2.3. Containerization (Docker & Docker Compose)

The entire development and operational environment is containerized for portability and reproducibility.
*   **`docker-compose.yml`:** Defines and links the services necessary for Project Nyra to run:
    *   **`metamcp` Service:** Runs the Python application for the MetaMCP agent. It mounts relevant project directories (`/data`) and depends on `ngrok` and `infisical`.
    *   **`ngrok` Service:** Provides secure ingress to the `metamcp` agent. It creates a public URL for the MetaMCP's API, enabling external tools and potentially other services to interact with it. It also facilitates the `ngrok-filesys` tool provider.
    *   **`infisical` Service:** An open-source secret management tool. It fetches sensitive environment variables (API keys, tokens) from a secure Infisical project and injects them into the `metamcp` container at runtime. This enhances security by keeping secrets out of code and configuration files.

### 2.4. Filesystem Interaction (`ngrok-filesys` Tools)

A crucial aspect of MetaMCP's ability to "act" on the environment.
*   **Remote Filesystem:** The `ngrok-filesys` provider, facilitated by the ngrok tunnel, allows MetaMCP to interact with a designated project data directory (`/data` within the Docker container, which maps to `C:/Dev/DevProjects/Personal-Projects/Project-Nyra/Project-Nyra` on the host).
*   **Capabilities:**
    *   `fs_list`, `fs_read_text`, `fs_write_text`: For basic file system operations.
    *   `git_init`, `git_clone`, `git_add_commit`, `git_push`, `git_pull`, etc.: For complete Git repository management.
    *   `gh_repo_create`, `gh_branch_create`, `gh_pr_create`: For interacting with the GitHub API.

### 2.5. Secret Management (Infisical)

Ensuring the secure handling of sensitive credentials.
*   **Centralized Secrets:** All API keys and tokens are stored in an Infisical project.
*   **Runtime Injection:** The `infisical` Docker service acts as an intermediary, securely fetching these secrets and making them available as environment variables to the `metamcp` container.
*   **Benefits:** Reduces the risk of exposing credentials in code, facilitates rotation, and improves compliance.

## 3. Data Flow and Interaction

1.  **Goal Ingestion:** A high-level goal or prompt is provided to the MetaMCP agent (e.g., via its exposed API).
2.  **MetaMCP Reasoning:** The MetaMCP agent uses its internal logic and selected LLM channels (e.g., Claude, Gemini) to understand the goal, break it down, and formulate a plan.
3.  **Tool Selection & Execution:** Based on the plan, MetaMCP selects and invokes appropriate tool channels (e.g., `fs-tool`, `git-tool`, `github-tool`).
4.  **Environment Interaction:** The chosen tools perform actions on the designated project directory (via `ngrok-filesys`) or interact with external services (GitHub API).
5.  **Feedback & Iteration:** Results from tool executions are fed back to MetaMCP. MetaMCP evaluates progress, revises its plan if necessary, and continues iterating until the goal is achieved.
6.  **Secret Management:** Infisical continuously provides necessary secrets to the `metamcp` service without exposing them in configuration files.
7.  **External Access:** The `ngrok` tunnel provides a secure endpoint for external interaction with the `metamcp` agent.

## 4. Security and Ethical Considerations

*   **Least Privilege:** Tools are configured to operate only within designated directories.
*   **Secret Management:** Infisical is a critical component for secure handling of API keys.
*   **Transparency:** The open-source nature of the project and detailed `channels.json` allow for scrutiny of AI capabilities and tool access.
*   **Ethical Guardrails:** The MetaMCP's reasoning process must incorporate ethical guidelines and safety protocols to prevent misuse.

This architecture provides a robust, flexible, and secure foundation for building and operating advanced autonomous AI agents within Project Nyra.
```

### Step 5: Create `docker-compose.yml`

Create a file named `docker-compose.yml` at `C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Project-Nyra\THE-TRUTH\CONFIG\docker-compose.yml` with the following exact content.

**IMPORTANT NOTE FOR AI:** Replace `NGROK_AUTHTOKEN_GOES_HERE` and `INFISICAL_TOKEN_GOES_HERE` with actual values. The `INFISICAL_TOKEN` should be an Infisical Service Token with read access to the project's secrets.

```yaml
version: '3.8'

services:
  metamcp:
    build:
      context: ../../  # Assuming MetaMCP Python project is in the parent of THE-TRUTH
      dockerfile: THE-TRUTH/Dockerfile
    container_name: metamcp
    ports:
      - "8000:8000" # Expose MetaMCP's API
    environment:
      # These will be fetched securely by Infisical CLI
      ANTHROPIC_API_KEY: "INFISICAL_ANTHROPIC_API_KEY"
      GOOGLE_API_KEY: "INFISICAL_GOOGLE_API_KEY"
      GITHUB_TOKEN: "INFISICAL_GITHUB_TOKEN"
      NGROK_AUTHTOKEN: "INFISICAL_NGROK_AUTHTOKEN"
    volumes:
      # Mount the entire Project-Nyra directory into the container
      # This allows MetaMCP (via ngrok-filesys) to interact with project files
      - C:/Dev/DevProjects/Personal-Projects/Project-Nyra/Project-Nyra:/data
    depends_on:
      - ngrok
      - infisical
    networks:
      - nyra-network

  ngrok:
    image: ngrok/ngrok:latest
    container_name: ngrok_tunnel
    restart: unless-stopped
    ports:
      - "4040:4040" # ngrok dashboard
    environment:
      NGROK_AUTHTOKEN: "NGROK_AUTHTOKEN_GOES_HERE" # Replace with your actual ngrok auth token
      NGROK_TUNNEL_CRT: "/etc/ngrok-certs/ngrok.crt" # Example if using custom certs
    command: ["start", "--all", "--config", "/etc/ngrok.yml"]
    volumes:
      - ./ngrok.yml:/etc/ngrok.yml # Mount ngrok config
    networks:
      - nyra-network
    depends_on:
      - metamcp # Ensure metamcp is up before ngrok tries to tunnel to it

  infisical:
    image: infisical/infisical-cli:latest
    container_name: infisical_secrets
    entrypoint: ["sh", "-c"]
    command:
      - |
        apk add curl # Ensure curl is available for health checks or external calls
        infisical auth --token "$INFISICAL_TOKEN"
        infisical export --env=production --format=docker > /app/secrets.env
        tail -f /dev/null # Keep container running
    environment:
      INFISICAL_TOKEN: "INFISICAL_TOKEN_GOES_HERE" # Replace with your Infisical Service Token
    volumes:
      - infisical_data:/root/.infisical # Persist Infisical login/config
      - ./secrets.env:/app/secrets.env # Output file for secrets
    networks:
      - nyra-network

networks:
  nyra-network:
    driver: bridge

volumes:
  infisical_data:
```

### Step 6: Create `channels.json`

Create a file named `channels.json` at `C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Project-Nyra\THE-TRUTH\CONFIG\channels.json` with the following exact content.

**IMPORTANT NOTE FOR AI:** If enabling `local-ollama-llama3-70b`, replace `<tailscale_ip_of_gpu_machine>` with the actual Tailscale IP address of the machine running Ollama.

```json
{
  "channels": [
    {
      "id": "claude-3-opus",
      "type": "llm",
      "provider": "anthropic",
      "model": "claude-3-opus-20240229",
      "description": "Anthropic Claude 3 Opus - best for complex reasoning, multi-step problem solving, and strategic planning.",
      "config": {
        "api_key_env": "ANTHROPIC_API_KEY",
        "temperature": 0.7,
        "max_tokens": 4000
      }
    },
    {
      "id": "gemini-1.5-pro",
      "type": "llm",
      "provider": "google",
      "model": "gemini-1.5-pro-latest",
      "description": "Google Gemini 1.5 Pro - strong multimodal capabilities, good for code generation, data analysis, and large context tasks.",
      "config": {
        "api_key_env": "GOOGLE_API_KEY",
        "temperature": 0.7,
        "max_tokens": 4000
      }
    },
    {
      "id": "local-ollama-llama3-70b",
      "type": "llm",
      "provider": "ollama",
      "model": "llama3:70b",
      "description": "Local Ollama Llama3 70B - a powerful open-source model running on a local GPU workstation for private, low-latency tasks.",
      "config": {
        "base_url": "http://<tailscale_ip_of_gpu_machine>:11434/api",
        "temperature": 0.7,
        "max_tokens": 4000
      },
      "enabled": false
    },
    {
      "id": "fs-tool",
      "type": "tool",
      "provider": "ngrok-filesys",
      "description": "Filesystem access tool for reading, writing, and listing files within the project data directory.",
      "tools": [
        "fs_list",
        "fs_read_text",
        "fs_write_text"
      ]
    },
    {
      "id": "git-tool",
      "type": "tool",
      "provider": "ngrok-filesys",
      "description": "Git operations tool for managing repositories (init, clone, status, add/commit, push/pull, branch).",
      "tools": [
        "git_init",
        "git_clone",
        "git_status",
        "git_set_remote",
        "git_add_commit",
        "git_switch_branch",
        "git_pull",
        "git_push",
        "git_lfs_install",
        "git_lfs_track"
      ]
    },
    {
      "id": "github-tool",
      "type": "tool",
      "provider": "ngrok-filesys",
      "description": "GitHub API tool for repository and branch management (create repo, create branch, create PR).",
      "tools": [
        "gh_repo_create",
        "gh_branch_create",
        "gh_pr_create"
      ],
      "config": {
        "github_token_env": "GITHUB_TOKEN"
      }
    }
  ],
  "default_llm_channel": "claude-3-opus"
}
```

### Step 7: Create `Dockerfile` (for MetaMCP)

Create a file named `Dockerfile` at `C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Project-Nyra\THE-TRUTH\Dockerfile` with the following exact content.

```dockerfile
# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for some Python packages (e.g., git)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose port 8000 for the MetaMCP API
EXPOSE 8000

# Define the command to run the MetaMCP application
# Assuming your MetaMCP main script is `main.py` and it starts a server on port 8000
CMD ["python", "main.py"]
```

### Step 8: Create `requirements.txt` (for MetaMCP)

Create a file named `requirements.txt` at `C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Project-Nyra\requirements.txt` (note: this is in the project root, not `THE-TRUTH`) with the following exact content.

**NOTE:** This `requirements.txt` is a placeholder. A real MetaMCP agent would have specific dependencies for LLM interaction, tool integration, web server (e.g., FastAPI, Flask), etc. An AI would need to populate this based on the MetaMCP agent's actual implementation.

```
# Example requirements for a MetaMCP agent
# A real MetaMCP agent would have specific dependencies for:
# - LLM interaction (e.g., anthropic, google-generativeai, openai, ollama_client)
# - Web framework (e.g., fastapi, uvicorn)
# - Tooling (e.g., gitpython, github, python-dotenv)
# - General utilities (e.g., rich, pydantic)

# Placeholder: Replace with actual dependencies for your MetaMCP agent
# fastapi
# uvicorn
# anthropic
# google-generativeai
# gitpython
# PyGithub
# python-dotenv
# ngrok (if using directly, though here it's a separate service)
```

### Step 9: Environment Variable Configuration (Infisical Integration)

1.  **Infisical Project:** Create an Infisical project (e.g., "Project Nyra") on Infisical Cloud.
2.  **Add Secrets:** Add the following secrets to your Infisical project (e.g., in the `production` environment):
    *   `ANTHROPIC_API_KEY`: Your Anthropic API key.
    *   `GOOGLE_API_KEY`: Your Google API key.
    *   `GITHUB_TOKEN`: Your GitHub Personal Access Token.
    *   `NGROK_AUTHTOKEN`: Your ngrok authentication token.
3.  **Service Token:** Generate an Infisical Service Token within your Infisical project. This token should have read access to the secrets.

The `docker-compose.yml` file uses the `infisical` service to fetch these secrets. The `INFISICAL_TOKEN` (which you will replace in `docker-compose.yml`) allows the Infisical CLI within the container to authenticate and retrieve the `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `GITHUB_TOKEN`, and `NGROK_AUTHTOKEN`, which are then made available as environment variables to the `metamcp` service.

### Step 10: Run the Services

1.  **Navigate:** Open a terminal and navigate to the `C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Project-Nyra\THE-TRUTH\CONFIG` directory.
2.  **Run Docker Compose:** Execute the following command:
    ```bash
    docker compose up -d
    ```
    This will build the `metamcp` image (if not already built), pull the `ngrok` and `infisical-cli` images, and start all services in detached mode.
3.  **Check Logs:** To monitor the services and get the ngrok URL:
    ```bash
    docker compose logs -f
    ```
    Look for output from the `ngrok_tunnel` service to find the public URL where `metamcp` is exposed.

### Step 11: Accessing MetaMCP

Once `docker compose up -d` is successful, the `metamcp` agent will be running.
*   The `ngrok_tunnel` service will create a public URL (e.g., `https://xxxx-xxxx-xxxx-xxxx-ngrok-free.app/`) that tunnels to the `metamcp` service on port 8000.
*   An AI agent would then interact with `MetaMCP` via its API exposed at this ngrok URL. The exact API endpoints would depend on the `MetaMCP` agent's implementation (e.g., `/prompt`, `/task`, etc.).

## 4. Key Considerations for AI Agents

When an AI agent (like Claude, Gemini, or Warp) is tasked with interacting with or developing for Project Nyra, it should keep the following in mind:

*   **Goal-Oriented Interaction:** MetaMCP expects high-level goals or complex prompts. It will then use its reasoning capabilities and tools to break down and solve the problem.
*   **Context Management:** MetaMCP maintains context across multiple steps. Provide clear, concise, and complete information in each interaction.
*   **Tool Utilization:** Understand that MetaMCP has access to various tools (filesystem, Git, GitHub). When a task requires interaction with the environment, suggest the use of these tools implicitly or explicitly in your prompts.
*   **Security Best Practices:** Always handle API keys and sensitive information securely, preferably through the Infisical integration. Never hardcode credentials.
*   **Modularity and Extensibility:** The system is designed to be expanded. If new LLMs or tools are needed, `channels.json` is the primary place to configure them.
*   **Ethical AI:** Adhere to the ethical principles outlined in the Manifesto. Ensure that any actions taken by MetaMCP are responsible, fair, and transparent.
*   **Error Handling and Debugging:** Be prepared to analyze Docker logs (`docker compose logs`) for debugging issues or understanding MetaMCP's thought process.

This document provides the foundational knowledge and instructions for any AI agent to fully comprehend and set up Project Nyra.
