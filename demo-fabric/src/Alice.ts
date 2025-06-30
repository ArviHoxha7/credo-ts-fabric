import { AskarModule } from '@credo-ts/askar'
import {
    Agent,
    DidsModule,
    InitConfig,
} from '@credo-ts/core'
import {
  HttpOutboundTransport,
  WsOutboundTransport,
  ConnectionsModule,
} from '@credo-ts/didcomm'
import { agentDependencies, HttpInboundTransport } from '@credo-ts/node'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'
import {
  FabricLedgerModule,
  FabricDidRegistrar,
  FabricDidResolver,
} from '@credo-ts/fabric-vdr'
const initializeAcmeAgent = async () => {
  // Simple agent configuration. This sets some basic fields like the wallet
  // configuration and the label.
  const config: InitConfig = {
    label: 'demo-agent-acme',
    walletConfig: {
      id: 'mainAcme',
      key: 'demoagentacme0000000000000000000',
    },
    endpoints: ['http://localhost:3001'],
  }

  // A new instance of an agent is created here
  const agent = new Agent({
    config,
    modules: {
      askar: new AskarModule({ ariesAskar }),
      connections: new ConnectionsModule({ autoAcceptConnections: true }),
      // ledger: new FabricLedgerModule(),
      dids: new DidsModule({
        registrars: [ new FabricDidRegistrar() ],
        resolvers: [ new FabricDidResolver() ],
      }),
      fabric: new FabricLedgerModule(),
    },
    dependencies: agentDependencies,
  })

  // Register a simple `WebSocket` outbound transport
  agent.registerOutboundTransport(new WsOutboundTransport())

  // Register a simple `Http` outbound transport
  agent.registerOutboundTransport(new HttpOutboundTransport())

  // Register a simple `Http` inbound transport
  agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }))

  // Initialize the agent
  await agent.initialize()

  return agent
}
export { initializeAcmeAgent }
