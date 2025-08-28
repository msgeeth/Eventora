// Simple toast fallback for development
export const toast = {
  success: (message: string) => {
    console.log('✅ Success:', message)
    // In a real app, you could show a browser notification or custom toast
  },
  error: (message: string) => {
    console.error('❌ Error:', message)
    // In a real app, you could show a browser notification or custom toast
  },
  info: (message: string) => {
    console.log('ℹ️ Info:', message)
  }
}