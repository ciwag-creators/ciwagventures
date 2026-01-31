import { VTUProvider, AirtimePayload, DataPayload } from './types'

export class CheapDataHubProvider implements VTUProvider {

  async airtime(payload: AirtimePayload) {
    /**
     * 🔧 Replace with real API call later
     */
    console.log('CheapDataHub airtime:', payload)

    return {
      success: true,
      provider_reference: `CDH-AIR-${Date.now()}`
    }
  }

  async data(payload: DataPayload) {
    console.log('CheapDataHub data:', payload)

    return {
      success: true,
      provider_reference: `CDH-DATA-${Date.now()}`
    }
  }
}
