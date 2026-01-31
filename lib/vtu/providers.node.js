export async function getActiveProvider() {
  return {
    name: 'mock-provider',
    buyData: async () => ({ success: true })
  }
}
