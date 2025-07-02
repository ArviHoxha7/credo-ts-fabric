import { injectable, inject } from '@credo-ts/core'
import type {
  AgentContext,
  DidCreateOptions,
  DidCreateResult,
  DidResolutionResult,
  Logger,
} from '@credo-ts/core'
import { JsonTransformer, DidDocument, InjectionSymbols } from '@credo-ts/core'
import { FabricModuleConfig } from '../FabricModuleConfig'

interface ReadResponse {
  result: {
    did: string
    verkey: string
    role: string
  }
}

@injectable()
export class FabricLedgerService {
  public constructor(
    @inject(InjectionSymbols.Logger) private logger: Logger,
    @inject(FabricModuleConfig) private config: FabricModuleConfig
  ) {}

  public async getDidDocument(
    _agentContext: AgentContext,
    did: string
  ): Promise<DidResolutionResult> {
    try {
      const parts = did.split(':')
      const networkName = parts[1]
      const networkConfig = this.config.networks.find(n => n.network === networkName)
      if (!networkConfig) throw new Error(`Network config not found for '${networkName}'`)
      const { baseUrl, token } = networkConfig

      console.log('[FabricLedgerService] Resolving DID:', did)
      const res = await fetch(
        `${baseUrl}/ReadTransaction/${encodeURIComponent(did)}/nym`,
        {
          headers: {
            Authorization: token ?? '',
          },
        }
      )
      if (!res.ok) throw new Error(`Ledger returned ${res.status}`)

      const json = (await res.json()) as ReadResponse
      console.log('[FabricLedgerService] ReadTransaction response:', json)
      const { verkey } = json.result

      const didDoc = JsonTransformer.fromJSON(
        {
          id: did,
          '@context': ['https://w3id.org/did/v1'],
          verificationMethod: [
            {
              id: `${did}#key-1`,
              type: 'Ed25519VerificationKey2018',
              controller: did,
              publicKeyBase58: verkey,
            },
          ],
          authentication: [`${did}#key-1`],
        },
        DidDocument
      )

      return {
        didDocument: didDoc,
        didResolutionMetadata: {},
        didDocumentMetadata: {},
      }
    } catch (error) {
      this.logger.error(`Failed to resolve DID '${did}':`, error)
      return {
        didDocument: null,
        didResolutionMetadata: { error: 'notFound', message: `${error}` },
        didDocumentMetadata: {},
      }
    }
  }

  public async createDid(
    _agentContext: AgentContext,
    options: DidCreateOptions
  ): Promise<DidCreateResult> {
    try {
      console.log('Creating DID on Fabric with options:', options)
      const opts = (options as any).options ?? {}
      const methodSpecificId: string | undefined = opts.methodSpecificId
      const verkey: string | undefined = opts.verkey
      if (!methodSpecificId || !verkey) {
        throw new Error('methodSpecificId and verkey are required')
      }

      const networkName = this.config.networks[0].network
      const did = `did:${networkName}:${methodSpecificId}`
      const networkConfig = this.config.networks.find(n => n.network === networkName)
      if (!networkConfig) throw new Error(`Network config not found for '${networkName}'`)
      const { baseUrl, token } = networkConfig

      const payload = {
        transaction: {
          operation: { dest: methodSpecificId, verkey, role: 'TRUST_ANCHOR' },
        },
        type: 'nym',
        network: networkName,
      }

      const res = await fetch(`${baseUrl}/CreateTransaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWxlY3RlZF9wZWVyIjoiMSJ9.eq_bDmbzklvvl8u4QhzGiGNQRsRhsd7GQEOD5IL0tf4',
          Authorization: token ?? '',
        },
        body: JSON.stringify(payload),
      })
      console.log('[FabricLedgerService] POST /CreateTransaction returned', await res.json())
      if (!res.ok) throw new Error(`Ledger returned ${res.status}`)

      const didDoc = JsonTransformer.fromJSON(
        {
          id: did,
          '@context': ['https://w3id.org/did/v1'],
          verificationMethod: [
            {
              id: `${did}#key-1`,
              type: 'Ed25519VerificationKey2018',
              controller: did,
              publicKeyBase58: verkey,
            },
          ],
          authentication: [`${did}#key-1`],
        },
        DidDocument
      )

      return {
        didState: {
          state: 'finished', 
          did, 
          secret: { verkey }, 
          didDocument: didDoc 
         },
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
      }
    } catch (error) {
      this.logger.error('Failed to create DID on Fabric:', error)
      return {
        didState: { state: 'failed', reason: `${error}` },
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
      }
    }
  }

  // Optional: schema & credential definition methods
  public async registerSchema(schema: any): Promise<{ success: boolean; id: string }> {
    // Implement similar to createDid with type: 'schema'
    throw new Error('Not implemented')
  }

  public async registerCredentialDefinition(
    credDef: any
  ): Promise<{ success: boolean; id: string }> {
    // Implement similar to createDid with type: 'credentialDefinition'
    throw new Error('Not implemented')
  }
}
