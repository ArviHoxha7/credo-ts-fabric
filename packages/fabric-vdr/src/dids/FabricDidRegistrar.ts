import { injectable, inject } from '@credo-ts/core'
import type {
  AgentContext,
  DidRegistrar,
  DidCreateOptions,
  DidCreateResult,
  DidUpdateOptions,
  DidUpdateResult,
  DidDeactivateResult,
} from '@credo-ts/core'
import { FabricLedgerService } from '../ledger/FabricLedgerService'

@injectable()
export class FabricDidRegistrar implements DidRegistrar {
  public readonly supportedMethods = ['testnet']

  public constructor(
    @inject(FabricLedgerService) private ledgerService: FabricLedgerService
  ) {}

  /**
   * Register a new DID on the Fabric network.
   * Delegates to POST /CreateTransaction with body:
   * {
   *   transaction: {
   *     operation: { dest, verkey, role: 'TRUST_ANCHOR' }
   *   },
   *   type: 'nym',
   *   network: 'testnet'
   * }
   */
  public async create(
    agentContext: AgentContext,
    options: DidCreateOptions
  ): Promise<DidCreateResult> {
    return this.ledgerService.createDid(agentContext, options)
  }

  /**
   * Update operation not supported for now.
   */
  public async update(
    agentContext: AgentContext,
    options: DidUpdateOptions
  ): Promise<DidUpdateResult> {
    return {
      didState: { state: 'failed', reason: 'Update not supported' },
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
    }
  }

  /**
   * Deactivate operation not supported for now.
   */
  public async deactivate(
    agentContext: AgentContext,
    options: unknown
  ): Promise<DidDeactivateResult> {
    return {
      didState: { state: 'failed', reason: 'Deactivate not supported' },
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
    }
  }
}

