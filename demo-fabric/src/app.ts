// demo.ts
import { BaseAgent } from './BaseAgent'
import { DidResolverService } from '@credo-ts/core'
import { FabricLedgerService } from '@credo-ts/fabric-vdr'

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
  // 3) Resolve the same DID
  const resolved = await base.agent.dids.resolve(did1)
  console.log('Resolved DID Document:', resolved.didDocument)

  // 4) Delete the DID using FabricLedgerService
  const fabricLedgerService = base.agent.dependencyManager.resolve(FabricLedgerService)
  const deleteResult = await fabricLedgerService.deleteDid(did1)
  console.log('🗑️ Delete result:', deleteResult)

}

run().catch(console.error)

