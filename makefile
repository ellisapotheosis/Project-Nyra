SHELL := /bin/bash

# 1. We manually define the 'infis' command here because Make can't read aliases
INFIS_CMD := infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" --

# 2. We define the exact path to Claude (from your 'which' command)
CLAUDE_PATH := /home/ellisapotheosis/.nvm/versions/node/v20.20.0/bin/claude

all: install run

install:
	bun install

run:
	# We combine them: Run Infisical -> then Run Claude
	export PYTHON_KEYRING_BACKEND=keyring.backends.null.Keyring && $(INFIS_CMD) $(CLAUDE_PATH)

docker:
	docker start nyra-nexus-router || docker run -d --name nyra-nexus-router -p 6000:6000 nexus-router

clean:
	rm -rf node_modules bun.lockb dist .cache
