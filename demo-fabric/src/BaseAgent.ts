import { Agent, DidsModule, InitConfig } from '@credo-ts/core'
import { AskarModule, AskarModuleConfigOptions } from '@credo-ts/askar'
import { askar } from '@openwallet-foundation/askar-nodejs'
import { agentDependencies } from '@credo-ts/node'
import { FabricModule } from '@credo-ts/fabric-vdr'
import { FabricDidRegistrar, FabricDidResolver } from '@credo-ts/fabric-vdr'

export class BaseAgent {
  public agent: Agent

  constructor(label: string) {
    const config: InitConfig = { label }

    const askarConfig: AskarModuleConfigOptions = {
      askar,
      store: { id: label, key: `${label}_wallet_key` },
    }

    const fabric = new FabricModule({
      networks: [
        {
          network: 'testnet',
          baseUrl: 'http://localhost:8000',
          token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWxlY3RlZF9wZWVyIjoiMSJ9.eq_bDmbzklvvl8u4QhzGiGNQRsRhsd7GQEOD5IL0tf4',
        },
      ],
    })

    this.agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        askar: new AskarModule(askarConfig),
        dids: new DidsModule({
          registrars: [ new FabricDidRegistrar() ],
          resolvers: [ new FabricDidResolver() ],
        }),
        fabric,
      },
    })
  }

  public async initialize() {
    await this.agent.initialize()
  }
}

