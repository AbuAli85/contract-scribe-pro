
/**
 * Navigation service to centralize routing logic
 */
export const navigationService = {
  /**
   * Navigate to print error page with error message
   */
  navigateToPrintError: (errorMessage?: string): void => {
    const url = errorMessage 
      ? `/print-error?error=${encodeURIComponent(errorMessage)}`
      : '/print-error'
    
    window.location.href = url
  },
  
  /**
   * Navigate to a specific route
   */
  navigateTo: (route: string): void => {
    window.location.href = route
  }
}
