export interface AirtimeRequest {
  network: string
  phone: string
  amount: number
  reference: string
}

export interface DataRequest {
  network: string
  phone: string
  planId: string
  amount: number
  reference: string
}

export interface BillRequest {
  service: 'electricity' | 'tv'
  provider: string
  meterNumber?: string
  smartCardNumber?: string
  amount: number
  reference: string
}

export interface VTUResponse {
  success: boolean
  message?: string
  cost_price?: number
  fee?: number
  token?: string
  raw?: any
}
