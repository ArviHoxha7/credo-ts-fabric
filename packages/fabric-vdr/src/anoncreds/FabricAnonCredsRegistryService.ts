import {
  AnonCredsRegistry,
  RegisterSchemaOptions,
  RegisterSchemaReturn,
} from '@credo-ts/anoncreds'
import type {
  GetSchemaReturn,
  GetCredentialDefinitionReturn,
  RegisterCredentialDefinitionReturn,
  GetRevocationRegistryDefinitionReturn,
  RegisterRevocationRegistryDefinitionReturn,
  GetRevocationStatusListReturn,
  RegisterRevocationStatusListReturn,
} from '@credo-ts/anoncreds'
import { AgentContext, CredoError } from '@credo-ts/core'
import { injectable } from 'tsyringe'
import { FabricLedgerService } from '../ledger/FabricLedgerService'

@injectable()
export class FabricAnonCredsRegistryService implements AnonCredsRegistry {
  public readonly methodName = 'fabric'
  public readonly supportedIdentifier = /^did:fabric:[a-zA-Z0-9]+:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/

  public async registerSchema(
    agentContext: AgentContext,
    options: RegisterSchemaOptions
  ): Promise<RegisterSchemaReturn> {
    try {
      const fabricLedgerService = agentContext.dependencyManager.resolve(FabricLedgerService)
      const { schema } = options

      // Prepare payload
      const payload = {
        identifier: schema.issuerId,
        operation: {
          data: {
            name: schema.name,
            version: schema.version,
            attr_names: schema.attrNames,
          },
        },
      }

      const result = await fabricLedgerService.sendTransaction({
        type: 'schema',
        transaction: payload,
      })

      if (!result.success) {
        throw new CredoError(`Schema registration failed: ${result.message ?? 'unknown reason'}`)
      }

      const schemaId = `${schema.issuerId}:2:${schema.name}:${schema.version}`

      return {
        schemaState: {
          state: 'finished',
          schema,
          schemaId,
        },
        schemaMetadata: {},
        registrationMetadata: {},
      }
    } catch (error) {
      agentContext.config.logger.error('Failed to register schema on Fabric:', {
        error,
        schema: options.schema,
      })

      return {
        schemaState: {
          state: 'failed',
          schema: options.schema,
          reason: `Schema registration failed: ${error.message}`,
        },
        schemaMetadata: {},
        registrationMetadata: {},
      }
    }
  }
  
  public async getSchema(agentContext: AgentContext, schemaId: string): Promise<GetSchemaReturn> {
    throw new Error('Method not implemented.')
  }
  public async getCredentialDefinition(
    agentContext: AgentContext,
    credentialDefinitionId: string
  ): Promise<GetCredentialDefinitionReturn> {
    // Implement logic to retrieve credential definition from Fabric ledger
    throw new Error('Method not implemented.')
  }
  public async registerCredentialDefinition(
    agentContext: AgentContext,
    options: any
  ): Promise<RegisterCredentialDefinitionReturn> {
    // Implement logic to register credential definition on Fabric ledger
    throw new Error('Method not implemented.')
  }
  public async getRevocationRegistryDefinition(
    agentContext: AgentContext,
    revocationRegistryDefinitionId: string
  ): Promise<GetRevocationRegistryDefinitionReturn> {
    // Implement logic to retrieve revocation registry definition from Fabric ledger
    throw new Error('Method not implemented.')
  }
  public async registerRevocationRegistryDefinition(
    agentContext: AgentContext,
    options: any
  ): Promise<RegisterRevocationRegistryDefinitionReturn> {
    // Implement logic to register revocation registry definition on Fabric ledger
    throw new Error('Method not implemented.')
  }
  public async getRevocationStatusList(
    agentContext: AgentContext,
    revocationRegistryId: string,
    timestamp: number
  ): Promise<GetRevocationStatusListReturn> {
    // Implement logic to retrieve revocation status list from Fabric ledger
    throw new Error('Method not implemented.')
  }
  public async registerRevocationStatusList(
    agentContext: AgentContext,
    options: any
  ): Promise<RegisterRevocationStatusListReturn> {
    // Implement logic to register revocation status list on Fabric ledger
    throw new Error('Method not implemented.')
  }
}

