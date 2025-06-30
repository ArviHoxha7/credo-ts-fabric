import { AskarModule } from '@credo-ts/askar'
import {
  Agent,
  InitConfig,
  WsOutboundTransport,
  HttpOutboundTransport,
  ConnectionsModule,
  DidsModule,
} from '@credo-ts/core'
import { agentDependencies } from '@credo-ts/node'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'
import {
  FabricLedgerModule,
  FabricDidRegistrar,
  FabricDidResolver,
} from '@credo-ts/fabric-vdr'
const initializeBobAgent = async () => {
  // Simple agent configuration. This sets some basic fields like the wallet
  // configuration and the label. It also sets the mediator invitation url,
  // because this is most likely required in a mobile environment.
  const config: InitConfig = {
    label: 'demo-agent-bob',
    walletConfig: {
      id: 'mainBob',
      key: 'demoagentbob00000000000000000000',
    },
  }

  // A new instance of an agent is created here
  const agent = new Agent({
    config,
    modules: {
      askar: new AskarModule({ ariesAskar }),
      connections: new ConnectionsModule({ autoAcceptConnections: true }),
      dids: new DidsModule({
        registrars: [new FabricDidRegistrar()],
        resolvers: [new FabricDidResolver()],
      }),
      fabric: new FabricLedgerModule(),
    },
    dependencies: agentDependencies,
  })

  // Register a simple `WebSocket` outbound transport
  agent.registerOutboundTransport(new WsOutboundTransport())

  // Register a simple `Http` outbound transport
  agent.registerOutboundTransport(new HttpOutboundTransport())

  // Initialize the agent
  await agent.initialize()

  return agent
}
export { initializeBobAgent }
