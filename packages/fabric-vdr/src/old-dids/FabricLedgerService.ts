import type {
  AgentContext,
  DidResolutionResult,
  DidCreateOptions,
  DidCreateResult,
} from '@credo-ts/core'
import { KeyType, DidDocument, JsonTransformer } from '@credo-ts/core'
import { Logger, InjectionSymbols } from '@credo-ts/core'
import { injectable, inject } from '@credo-ts/core'

// Define minimal shape for Schema and Credential Definition records
export interface Schema {
  id: string
  attrNames: string[]
  name: string
  version: string
  issuerId: string
}

export interface CredentialDefinition {
  id: string
  schemaId: string
  issuerId: string
  type: string
  tag: string
}

@injectable()
export class FabricLedgerService {

  // @ts-ignore
  constructor(@inject(InjectionSymbols.Logger) private logger: Logger) {}

  public async getDidDocument(agentContext: AgentContext, did: string): Promise<DidResolutionResult> {
    this.logger.debug(`Resolving DID from Fabric: ${did}`)

    try {
      const res = await fetch(`http://localhost:8000/did/${did}`)
      const didDocument = await res.json()

      return {
        didDocument: didDocument as DidDocument,
        didResolutionMetadata: {},
        didDocumentMetadata: {},
      }
    } catch (error) {
      this.logger.error(`Failed to resolve DID from Fabric`)
      return {
        didDocument: null,
        didResolutionMetadata: { error: 'notFound' },
        didDocumentMetadata: {},
      }
    }
  }

  public async createDid(
    agentContext: AgentContext,
    options: DidCreateOptions
  ): Promise<DidCreateResult> {

    const opts = (options as any).options ?? {}

    const methodSpecificId: string | undefined = opts.methodSpecificId
    const providedVerkey: string | undefined = opts.verkey
    const role: string | undefined = opts.role
    const network: string = opts.network ?? 'testnet'
    console.log('Creating DID on Fabric with options:', options)

    if (!methodSpecificId) {
      throw new Error('MethodSpecificId is required to create a DID.')
    }

    const did = `did:${network ?? 'testnet'}:${methodSpecificId}`
    const wallet = agentContext.wallet
    const { publicKeyBase58: verkey } = providedVerkey
      ? { publicKeyBase58: providedVerkey }
      : await wallet.createKey({ keyType: KeyType.Ed25519 })

    const didDocument = JsonTransformer.fromJSON(
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

    const payload = {
      transaction: {
        identifier: did,
        operation: {
          dest: methodSpecificId,
          verkey,
          role: role ?? 'TRUST_ANCHOR',
        },
      },
      type: 'nym',
      network: network ?? 'testnet',
    }
    // console.log('Payload to Fabric:', JSON.stringify(payload, null, 2))

    try {
      const res = await fetch('http://localhost:8000/CreateTransaction', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWxlY3RlZF9wZWVyIjoiMSJ9.eq_bDmbzklvvl8u4QhzGiGNQRsRhsd7GQEOD5IL0tf4',
        },
      })

      if (!res.ok) throw new Error(`Ledger error ${res.status}`)

      return {
        didState: {
          state: 'finished',
          did,
          secret: { verkey },
          didDocument,
        },
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
      }
    } catch (error) {
      // this.logger.error('Failed to create DID')
      const errorText = error instanceof Error ? error.message : String(error)
      this.logger.error('❌ Failed to create DID on Fabric:')
      this.logger.error(errorText)
      this.logger.info('Payload to Fabric:')
      this.logger.info(JSON.stringify(payload, null, 2))
      return {
        didState: {
          state: 'failed',
          reason: 'Fabric error',
        },
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
      }
    }
  }
  public async registerSchema(agentContext: AgentContext, schema: {
    name: string
    version: string
    attrNames: string[]
    issuerId: string
  }): Promise<any> {
    const transaction = {
      identifier: schema.issuerId,
      operation: {
        data: {
          name: schema.name,
          version: schema.version,
          attr_names: schema.attrNames,
        },
      },
    }

    const payload = {
      transaction: JSON.stringify(transaction),
      type: 'schema',
      network: 'testnet',
    }

    const id = `${schema.issuerId}:2:${schema.name}:${schema.version}`

    try {
      const res = await fetch('http://localhost:8000/CreateTransaction', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error(`Failed to register schema (${res.status})`)

      return {
        ver: '1.0',
        id,
        name: schema.name,
        version: schema.version,
        attrNames: schema.attrNames,
        seqNo: 0,
      }
    } catch (error) {
      this.logger.error('Error registering schema')
      throw error
    }
  }

  public async getSchema(agentContext: AgentContext, schemaId: string): Promise<any> {
  const payloadUrl = `http://localhost:8000/ReadTransaction/${encodeURIComponent(schemaId)}/schema`

  try {
    const res = await fetch(payloadUrl)
    if (!res.ok) throw new Error(`Schema not found (${res.status})`)
      return await res.json()
    } catch (error) {
      this.logger.error(`Error fetching schema ${schemaId}`)
      throw error
    }
  }


  public async registerCredentialDefinition(agentContext: AgentContext, credDef: {
    issuerId: string
    schemaId: string
    tag: string
    type: string
    value: {
      primary: any
      revocation?: any
    }
  }): Promise<any> {
    const transaction = {
      identifier: credDef.issuerId,
      operation: {
        ref: credDef.schemaId,
        tag: credDef.tag,
        signature_type: credDef.type,
        data: {
          primary: credDef.value.primary,
          revocation: credDef.value.revocation ?? null,
        },
      },
    }

    const payload = {
      transaction: JSON.stringify(transaction),
      type: 'credentialDefinition',
      network: 'testnet',
    }

    const id = `${credDef.issuerId}:3:${credDef.type}:${credDef.schemaId}:${credDef.tag}`

    try {
      const res = await fetch('http://localhost:8000/CreateTransaction', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error(`Failed to register credential definition (${res.status})`)

      return {
        ver: '1.0',
        id,
        schemaId: credDef.schemaId,
        type: credDef.type,
        tag: credDef.tag,
        value: credDef.value,
      }
    } catch (error) {
      this.logger.error('Error registering credential definition')
      throw error
    }
  }

  public async getCredentialDefinition(agentContext: AgentContext, credDefId: string): Promise<any> {
    const payloadUrl = `http://localhost:8000/ReadTransaction/${encodeURIComponent(credDefId)}/credentialDefinition`

    try {
      const res = await fetch(payloadUrl)
      if (!res.ok) throw new Error(`Credential definition not found (${res.status})`)
      return await res.json()
    } catch (error) {
      this.logger.error(`Error fetching credential definition ${credDefId}`)
      throw error
    }
  }
}

