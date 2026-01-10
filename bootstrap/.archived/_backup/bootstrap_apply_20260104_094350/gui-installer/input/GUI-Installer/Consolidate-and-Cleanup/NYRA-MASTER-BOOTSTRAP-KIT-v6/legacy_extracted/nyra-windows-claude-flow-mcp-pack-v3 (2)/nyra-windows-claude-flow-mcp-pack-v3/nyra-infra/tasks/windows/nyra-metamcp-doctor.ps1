docker network inspect nyra-network 2>$null|Out-Null;if($LASTEXITCODE -ne 0){docker network create nyra-network|Out-Null}
docker compose -f nyra-infra\compose\compose.metamcp.yml --env-file nyra-infra\.env up -d metamcp
