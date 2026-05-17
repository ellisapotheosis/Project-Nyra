"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";

interface Worker {
  id: string;
  name: string;
  gpu: string;
  vram: number;
  status: "active" | "idle" | "offline";
  utilization: number;
  temperature: number;
  models: string[];
}

export default function WorkersPage() {
  const { user } = useAuth();
  const workers: Worker[] = [
    {
      id: "1",
      name: "RTX 5090",
      gpu: "NVIDIA RTX 5090",
      vram: 48,
      status: "active",
      utilization: 92,
      temperature: 68,
      models: ["DeepSeek-R1 236B", "Qwen 2.5 72B"],
    },
    {
      id: "2",
      name: "RTX 3090 Ti",
      gpu: "NVIDIA RTX 3090 Ti",
      vram: 24,
      status: "active",
      utilization: 78,
      temperature: 62,
      models: ["Llama 3.1 70B", "Mistral 123B"],
    },
    {
      id: "3",
      name: "RTX 3060",
      gpu: "NVIDIA RTX 3060",
      vram: 12,
      status: "idle",
      utilization: 15,
      temperature: 45,
      models: ["CodeLlama 34B", "Qwen 32B"],
    },
  ];

  const statusColor = (status: Worker["status"]) => {
    const colors = {
      active: "bg-green-500/20 text-green-400",
      idle: "bg-yellow-500/20 text-yellow-400",
      offline: "bg-red-500/20 text-red-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          GPU Workers
        </h1>
        <p className="text-gray-400">
          Monitor and manage local GPU inference cluster
        </p>
      </div>

      <div className="grid gap-6">
        {workers.map((worker) => (
          <Link key={worker.id} href={`/workers/${worker.id}`}>
            <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-xl hover:border-primary/30 transition-all group overflow-hidden cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {worker.name}
                    </h2>
                    <p className="text-sm text-gray-400">{worker.gpu}</p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded font-semibold capitalize ${statusColor(worker.status)}`}
                  >
                    {worker.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">VRAM</p>
                    <p className="text-lg font-bold text-cyan-400">
                      {worker.vram}GB
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Utilization</p>
                    <p className="text-lg font-bold text-green-400">
                      {worker.utilization}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Temperature</p>
                    <p className="text-lg font-bold text-pink-400">
                      {worker.temperature}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="text-lg font-bold text-purple-400">Online</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Active Models</p>
                  <div className="flex flex-wrap gap-2">
                    {worker.models.map((model) => (
                      <span
                        key={model}
                        className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
