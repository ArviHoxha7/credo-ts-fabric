// demo.ts
import { BaseAgent } from './BaseAgent'
import { DidResolverService } from '@credo-ts/core'

async function run() {
  // 1) Create & initialize the agent
  const base = new BaseAgent('demo')
  await base.initialize()

  // 2) Create a DID on Fabric
  const { didState } = await base.agent.dids.create({
    method: 'fabric',
    options: {
      methodSpecificId: 'demo123',
      verkey: 'DemoVerkey123',
    },
  })
  const did1 = didState.did!
  console.log('DID created:', did1)
  const didResolverService = base.agent.dependencyManager.resolve(DidResolverService)
  console.log('Supported DID methods (Resolver):', didResolverService.supportedMethods)
  // 3) Resolve the same DID
  const resolved = await base.agent.dids.resolve(did1)
  console.log('Resolved DID Document:', resolved.didDocument)
}

run().catch(console.error)

