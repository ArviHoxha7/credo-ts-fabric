import { injectable, inject } from '@credo-ts/core'
import type { AgentContext, DidResolver, DidResolutionResult } from '@credo-ts/core'
import { FabricLedgerService } from '../ledger/FabricLedgerService'

@injectable()
export class FabricDidResolver implements DidResolver {
  public readonly supportedMethods = ['fabric']
  public readonly allowsCaching = true

  public async resolve(
    agentContext: AgentContext,
    did: string
  ): Promise<DidResolutionResult> {
    const ledgerService = agentContext.dependencyManager.resolve(FabricLedgerService)
    return ledgerService.getDidDocument(agentContext, did)
  }
}

