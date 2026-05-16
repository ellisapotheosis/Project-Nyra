import { INexusRouterClient, IntegrationHealth } from "./index";
import axios from "axios";

export class NexusRouterIntegrationAdapter implements INexusRouterClient {
  private url: string;
  private apiKey: string;

  constructor(url: string, apiKey: string) {
    this.url = url;
    this.apiKey = apiKey;
  }

  async routeTask(
    task: string,
    risk: string
  ): Promise<{ workerId: string; model: string }> {
    const response = await axios.post(
      this.url,
      {
        query: `
        mutation RouteTask($task: String!, $risk: String!) {
          route(task: $task, risk: $risk) {
            workerId
            model
          }
        }
      `,
        variables: { task, risk },
      },
      {
        headers: { "x-api-key": this.apiKey },
      }
    );

    return response.data.data.route;
  }

  async checkHealth(): Promise<IntegrationHealth> {
    try {
      await axios.post(
        this.url,
        { query: "{ __typename }" },
        {
          headers: { "x-api-key": this.apiKey },
        }
      );
      return { status: "HEALTHY" };
    } catch (e) {
      return { status: "DOWN", message: (e as Error).message };
    }
  }
}
