import { useArchon } from '@archonai/react';
import { PocketFlowAgent } from '@pocketflow/core';
import { LettAIHook } from '@lettai/react';

export const PocketFlowController = () => {
  const { spawn } = useArchon();
  const { getOptimalBlueprint } = LettAIHook.useMemory();

  const spawnPocketFlow = (task) => {
    const blueprint = getOptimalBlueprint(task.type);
    return spawn(
      <PocketFlowAgent 
        config={blueprint}
        capabilities={[
          'code_generation',
          'unit_testing',
          'debugging',
          'ci_integration'
        ]}
        resourceProfile="gpu-enhanced"
      />
    );
  };

  return (
    <AutoScaler 
      minInstances={2}
      maxInstances={8}
      spawnFunction={spawnPocketFlow}
      cooldownPeriod={120}
    />
  );
};