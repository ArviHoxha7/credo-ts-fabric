import type {
  AgentContext,
  DidCreateOptions,
  DidCreateResult,
  DidRegistrar,
} from '@credo-ts/core'

import { injectable } from '@credo-ts/core'
import { DidDocumentBuilder } from '@credo-ts/core'


@injectable()
export class FabricDidRegistrar implements DidRegistrar {
  public readonly supportedMethods = ['testnet']

  public async create(agentContext: AgentContext, options: DidCreateOptions): Promise<DidCreateResult> {
    const opts = (options as any).options ?? {}
    const methodSpecificId: string | undefined = opts.methodSpecificId
    const verkey: string | undefined = opts.verkey
    const network = opts.network ?? 'testnet'

    if (!methodSpecificId || !verkey) {
      return {
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
        didState: {
          state: 'failed',
          reason: 'Missing methodSpecificId or verkey',
        },
      }
    }

    const did = `did:${network}:${methodSpecificId}`

    try {

      const didDoc = new DidDocumentBuilder(did)
        .addVerificationMethod({
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2018',
          controller: did,
          publicKeyBase58: verkey,
        })
        .addAuthentication(`${did}#key-1`)
        .build()

      return {
        didState: {
          state: 'finished',
          did,
          secret: { verkey },
          didDocument: didDoc,
        },
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
      }
    } catch (error) {
      return {
        didState: {
          state: 'failed',
          reason: `Fabric create error: ${(error as Error).message}`,
        },
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
      }
    }
  }

  public async update(): Promise<DidCreateResult> {
    return {
      didState: {
        state: 'failed',
        reason: 'Update not supported',
      },
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
    }
  }

  public async deactivate(): Promise<DidCreateResult> {
    return {
      didState: {
        state: 'failed',
        reason: 'Deactivate not supported',
      },
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
    }
  }
}

