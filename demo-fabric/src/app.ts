// demo.ts
import { BaseAgent } from './BaseAgent'
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
  await base.agent.modules.anoncreds.registerSchema({
  schema: {
    name: 'TestSchema',
    version: '1.0',
    attrNames: ['name', 'age', 'email'],
    issuerId: 'did:testnet:demo123',
  }
})

  // 3) Resolve the same DID
  // const resolved = await base.agent.dids.resolve(did1)
  // console.log('Resolved DID Document:', resolved.didDocument)
  //
  // // 4) Update DID with a new verkey
  // const ledgerService = base.agent.dependencyManager.resolve(FabricLedgerService)
  // await ledgerService.updateDid(did1, {
  //   verkey: 'newVerkey',
  // })
  // const didDoc = await base.agent.dids.resolve(did1)
  // console.log('Resolved DID after update:', didDoc.didDocument)
  //
  // // 5) Delete the DID using FabricLedgerService
  // const fabricLedgerService = base.agent.dependencyManager.resolve(FabricLedgerService)
  // await fabricLedgerService.deleteDid(did1)

}

run().catch(console.error)

