# Worker RTX3060 Setup (Ollama)

This worker PC is configured to run local AI models using Ollama.

## Prerequisites

1.  **Docker & Docker Compose:** Ensure Docker and Docker Compose are installed on this machine.
2.  **NVIDIA Drivers:** Install the latest NVIDIA drivers for your RTX 3060 laptop.
3.  **NVIDIA Container Toolkit:** You must install the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) to allow Docker to access the GPU. This is a critical step.

## Setup

1.  **Copy this Folder:** Ensure this `worker-rtx3060` directory is on the Alienware m15r7 laptop.
2.  **Navigate to this Directory:** Open a terminal and run `cd /path/to/worker-rtx3060`.
3.  **Run the 'up' script:**
    ```bash
    bash up.sh
    ```
4.  The first time you run this, it will download the Ollama Docker image, start the service, and automatically pull the recommended `llama3:8b` model.

## Scripts

-   `up.sh`: Starts the Ollama container and pulls the default model.
-   `down.sh`: Stops and removes the Ollama container.
-   `doctor.sh`: Runs a health check to verify the container and API are running correctly.

## Model Management

To interact with Ollama directly or to pull different models, you can use the `docker compose exec` command from within this directory:

```bash
# Pull a different model (e.g., Mistral)
docker compose exec ollama ollama pull mistral

# List your currently downloaded models
docker compose exec ollama ollama list
```
