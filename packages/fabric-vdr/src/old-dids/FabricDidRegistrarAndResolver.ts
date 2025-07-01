import {
  AgentContext,
  DidCreateOptions,
  DidCreateResult,
  DidResolutionResult,
  DidRegistrar,
  DidResolver,
} from '@credo-ts/core'
import { injectable } from 'tsyringe'
import { FabricLedgerService } from './FabricLedgerService'

@injectable()
export class FabricDidRegistrar implements DidRegistrar {
  public readonly supportedMethods = ['fabric']

  public async create(
    agentContext: AgentContext,
    options: DidCreateOptions
  ): Promise<DidCreateResult> {
    const ledgerService = agentContext.dependencyManager.resolve(FabricLedgerService)
    return await ledgerService.createDid(agentContext, options)
  }

  public async update(): Promise<never> {
    throw new Error('Update not supported for did:fabric')
  }

  public async deactivate(): Promise<never> {
    throw new Error('Deactivate not supported for did:fabric')
  }
}

@injectable()
export class FabricDidResolver implements DidResolver {
  public readonly supportedMethods = ['fabric']
  public readonly allowsCaching = false

  public async resolve(agentContext: AgentContext, did: string): Promise<DidResolutionResult> {
    const ledgerService = agentContext.dependencyManager.resolve(FabricLedgerService)
    return await ledgerService.getDidDocument(agentContext, did)
  }
}

