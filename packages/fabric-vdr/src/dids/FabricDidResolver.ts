import { injectable, inject } from '@credo-ts/core'
import type { AgentContext, DidResolver, DidResolutionResult } from '@credo-ts/core'
import { FabricLedgerService } from '../ledger/FabricLedgerService'

@injectable()
export class FabricDidResolver implements DidResolver {
  public readonly supportedMethods = ['testnet']
  public readonly allowsCaching = true

  public constructor(
    @inject(FabricLedgerService) private ledgerService: FabricLedgerService
  ) {}

  /**
   * Resolve a DID on the Fabric network.
   * Delegates to GET /ReadTransaction/:id/nym, then wraps the response
   * as a W3C DID Document.
   */
  public async resolve(
    agentContext: AgentContext,
    did: string
  ): Promise<DidResolutionResult> {
    return this.ledgerService.getDidDocument(agentContext, did)
  }
}

