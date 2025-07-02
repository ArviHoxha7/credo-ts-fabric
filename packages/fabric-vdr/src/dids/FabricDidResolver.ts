import { injectable, inject } from '@credo-ts/core'
import type { AgentContext, DidResolver, DidResolutionResult } from '@credo-ts/core'
import { FabricLedgerService } from '../ledger/FabricLedgerService'

@injectable()
export class FabricDidResolver implements DidResolver {
  public readonly supportedMethods = ['fabric', 'testnet']
  public readonly allowsCaching = true

  public async resolve(
    agentContext: AgentContext,
    did: string
  ): Promise<DidResolutionResult> {
    console.log('[FabricDidResolver] Resolving DID:', did)
    const ledgerService = agentContext.dependencyManager.resolve(FabricLedgerService)
    return ledgerService.getDidDocument(agentContext, did)
  }
}

