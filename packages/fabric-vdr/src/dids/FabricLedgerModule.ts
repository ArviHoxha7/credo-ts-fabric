import { Module, DependencyManager } from '@credo-ts/core'
import { FabricLedgerService } from './FabricLedgerService'

export class FabricLedgerModule implements Module {
  public readonly metadata = { name: 'FabricLedgerModule' }

  register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(FabricLedgerService)
  }
}

