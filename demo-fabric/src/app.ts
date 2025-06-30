import { 
  Agent,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  DidExchangeState,
  OutOfBandRecord,
} from '@credo-ts/core'
import { initializeBobAgent } from './Bob'
import { initializeAcmeAgent } from './Alice'

import { DidRegistrarService, DidResolverService } from '@credo-ts/core'
const createNewInvitation = async (agent: Agent) => {
  const outOfBandRecord = await agent.oob.createInvitation()

  return {
    invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'https://example.org' }),
    outOfBandRecord,
  }
}

const receiveInvitation = async (agent: Agent, invitationUrl: string) => {
  const { outOfBandRecord } = await agent.oob.receiveInvitationFromUrl(invitationUrl)

  return outOfBandRecord
}

const setupConnectionListener = (agent: Agent, outOfBandRecord: OutOfBandRecord, cb: (...args: any) => void) => {
  agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
    if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return
    if (payload.connectionRecord.state === DidExchangeState.Completed) {
      // the connection is now ready for usage in other protocols!
      console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`)

      // Custom business logic can be included here
      // In this example we can send a basic message to the connection, but
      // anything is possible
      cb()

      // We exit the flow
      process.exit(0)
    }
  })
}


const run = async () => {
  console.log('Initializing Bob agent...')
  const bobAgent = await initializeBobAgent()
  console.log('Initializing Acme agent...')
  const acmeAgent = await initializeAcmeAgent()

  // const didRegistrarService = acmeAgent.dependencyManager.resolve(DidRegistrarService)
  // console.log('Supported methods:', didRegistrarService.supportedMethods)
  //
  // const didResolverService = acmeAgent.dependencyManager.resolve(DidResolverService)
  // console.log('Supported DID methods (Resolver):', didResolverService.supportedMethods)

  console.log('Registering DID on Fabric for Acme...')
  const didResult = await acmeAgent.dids.create({
    method: 'fabric',
    options: {
      methodSpecificId: `acme-${Date.now()}`,
      role: 'TRUST_ANCHOR',
      network: 'testnet',
    },
  })

  console.log('Acme DID created:')
  console.log(JSON.stringify(didResult.didState, null, 2))

  console.log('Creating the invitation as Acme...')
  const { outOfBandRecord, invitationUrl } = await createNewInvitation(acmeAgent)

  console.log('Listening for connection changes...')
  setupConnectionListener(acmeAgent, outOfBandRecord, () =>
    console.log('We now have an active connection to use!')
  )

  console.log('Accepting the invitation as Bob...')
  await receiveInvitation(bobAgent, invitationUrl)
}

export default run

void run()

