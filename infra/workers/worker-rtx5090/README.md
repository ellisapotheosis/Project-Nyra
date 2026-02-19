# Worker RTX5090 Setup (VLLM + LMCache)

This worker PC is configured to run local AI models using the high-throughput VLLM engine, with LMCache for response caching.

## Prerequisites

1.  **Docker & Docker Compose:** Ensure Docker and Docker Compose are installed on this machine.
2.  **NVIDIA Drivers:** Install the latest NVIDIA drivers for your RTX 5090.
3.  **NVIDIA Container Toolkit:** You must install the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) to allow Docker to access the GPU. This is a critical step.

## Setup

1.  **Copy this Folder:** Ensure this `worker-rtx5090` directory is on the Alienware Area-51 laptop.
2.  **Navigate to this Directory:** Open a terminal and run `cd /path/to/worker-rtx3090ti`.
3.  **Review the `.env` file:** The `docker-compose.yml` uses an `.env` file to specify the model. The default model is selected to be fast and fit comfortably within 24GB VRAM.
4.  **Run the 'up' script:**
    ```bash
    bash up.sh
    ```
5.  **Patience is Key:** The first time you run this, it will download the VLLM Docker image. The VLLM container will then download the entire language model (e.g., `meta-llama/Meta-Llama-3-8B-Instruct`), which is many gigabytes. This can take a significant amount of time depending on your internet connection. Check the logs (`docker compose logs -f vllm`) to monitor progress.

## Scripts

-   `up.sh`: Starts the VLLM and LMCache containers.
-   `down.sh`: Stops and removes the containers.
-   `doctor.sh`: Runs a health check to verify the containers and APIs are running.

## Model Configuration

The model is configured in the `.env` file. To change the model, edit the `VLLM_MODEL` variable. You can find compatible models on Hugging Face.

-   **Default Model:** `meta-llama/Meta-Llama-3-70B-Instruct` (A powerful, state-of-the-art model that takes advantage of high VRAM.)
-   **Alternative:** A quantized version of an even larger model, or a smaller model like Llama-3-8B for maximum speed.
