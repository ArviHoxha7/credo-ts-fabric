// demo.ts
import { BaseAgent } from './BaseAgent'

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
  console.log('DID created:', didState.did)

  // 3) Resolve the same DID
  const resolved = await base.agent.dids.resolve(didState.did!)
  console.log('Resolved DID Document:', resolved.didDocument)
}

run().catch(console.error)

