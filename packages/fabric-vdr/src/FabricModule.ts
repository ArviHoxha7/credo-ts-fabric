import type { AgentContext, DependencyManager, Module } from '@credo-ts/core';
import type { FabricModuleConfigOptions } from './FabricModuleConfig';

import { AgentConfig, Buffer, DidResolverService, DidRegistrarService } from '@credo-ts/core';
import { FabricModuleConfig } from './FabricModuleConfig';
import { FabricLedgerService } from './ledger';
import { FabricDidRegistrar } from './dids/FabricDidRegistrar';
import { FabricDidResolver } from './dids/FabricDidResolver';

export class FabricModule implements Module {
  public readonly config: FabricModuleConfig;

  public constructor(config: FabricModuleConfigOptions) {
    this.config = new FabricModuleConfig(config);
  }

  public register(dependencyManager: DependencyManager) {
    // Warn that this module is experimental
    dependencyManager.resolve(AgentConfig).logger.warn(
      "The 'fabric-vdr' module is experimental and may have breaking changes."
    );

    dependencyManager.registerInstance(FabricModuleConfig, this.config);
    dependencyManager.registerSingleton(FabricLedgerService);
    dependencyManager.registerSingleton(FabricDidRegistrar)
    dependencyManager.registerSingleton(FabricDidResolver)


    // Ensure Buffer is globally available
    global.Buffer = global.Buffer || Buffer;
  }

  public async initialize(agentContext: AgentContext): Promise<void> {
    // Placeholder for any async initialization
    void agentContext;
  }
}
