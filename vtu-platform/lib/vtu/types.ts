export interface AirtimePayload {
  network: string
  phone: string
  amount: number
  reference: string
}

export interface DataPayload {
  network: string
  phone: string
  planId: string
  amount: number
  reference: string
}

export interface VTUResponse {
  success: boolean
  provider_reference?: string
  message?: string
}

export interface VTUProvider {
  airtime(payload: AirtimePayload): Promise<VTUResponse>
  data(payload: DataPayload): Promise<VTUResponse>
}
