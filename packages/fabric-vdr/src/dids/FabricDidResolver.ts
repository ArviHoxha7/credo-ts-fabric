import type { AgentContext, DidResolutionResult, DidResolver, ParsedDid } from '@credo-ts/core'
import { DidDocument, JsonTransformer, injectable } from '@credo-ts/core'

import { FabricLedgerService } from '../ledger/FabricLedgerService'

@injectable()
export class FabricDidResolver implements DidResolver {
  public readonly supportedMethods = ['testnet']
  public readonly allowsCaching = true
  public readonly allowsLocalDidRecord = true

  public async resolve(agentContext: AgentContext, didUrl: string, parsed: ParsedDid): Promise<DidResolutionResult> {
    const fabricLedgerService = agentContext.dependencyManager.resolve(FabricLedgerService)
    const did = parsed.did

    try {
      const { didDocument: jsonDoc } = await fabricLedgerService.getDidDocument(agentContext, did)

      if (!jsonDoc) {
        return {
          didDocument: null,
          didDocumentMetadata: {},
          didResolutionMetadata: {
            error: 'notFound',
            message: `DID not found: ${did}`,
          },
        }
      }

      const didDocument = JsonTransformer.fromJSON(jsonDoc, DidDocument)

      return {
        didDocument,
        didDocumentMetadata: {},
        didResolutionMetadata: {},
      }
    } catch (error) {
      return {
        didDocument: null,
        didDocumentMetadata: {},
        didResolutionMetadata: {
          error: 'notFound',
          message: `Fabric resolution error: ${(error as Error).message}`,
        },
      }
    }
  }
}

