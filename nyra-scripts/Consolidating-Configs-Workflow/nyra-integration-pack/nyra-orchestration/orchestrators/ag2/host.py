import asyncio
from autogen_ext.runtimes.grpc import GrpcWorkerAgentRuntimeHost, GrpcWorkerAgentRuntime
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient

async def main():
    host = GrpcWorkerAgentRuntimeHost(address="0.0.0.0:50051")
    await host.start()
    worker = GrpcWorkerAgentRuntime(host_address="localhost:50051")
    await worker.start()

    async def mk():
        return AssistantAgent("nyra-toy", OpenAIChatCompletionClient(model="gpt-4o-mini"))

    await AssistantAgent.register(worker, "nyra-toy", mk)
    print("[Nyra] AG2 host+worker online.")
    while True:
        await asyncio.sleep(3600)

if __name__ == "__main__":
    asyncio.run(main())
