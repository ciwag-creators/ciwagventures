import {
  AirtimeRequest,
  DataRequest,
  BillRequest,
  VTUResponse
} from './types'

const vtuProvider = {
  async airtime(payload: AirtimeRequest): Promise<VTUResponse> {
    // mock provider
    return {
      success: true,
      message: 'Airtime sent',
      cost_price: payload.amount - 20,
      fee: 10
    }
  },

  async data(payload: DataRequest): Promise<VTUResponse> {
    return {
      success: true,
      message: 'Data sent',
      cost_price: payload.amount - 30,
      fee: 15
    }
  },

  async bill(payload: BillRequest): Promise<VTUResponse> {
    return {
      success: true,
      message: 'Bill payment successful',
      token: '1234-5678-9012',
      cost_price: payload.amount - 50,
      fee: 20
    }
  }
}

export default vtuProvider
