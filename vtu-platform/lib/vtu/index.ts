import { CheapDataHubProvider } from './cheapdatahub'
import { VTUProvider } from './types'

let provider: VTUProvider

const PROVIDER = process.env.VTU_PROVIDER || 'cheapdatahub'

switch (PROVIDER) {
  case 'cheapdatahub':
    provider = new CheapDataHubProvider()
    break

  default:
    throw new Error('Invalid VTU provider')
    
}
async bill(payload: {
  service: 'electricity' | 'tv'
  provider: string
  meterNumber?: string
  smartCardNumber?: string
  amount: number
  reference: string
}) {
  // later: call real provider API
  return {
    success: true,
    token: '1234-5678-9012',
    message: 'Payment successful'
  }
}
export default provider
