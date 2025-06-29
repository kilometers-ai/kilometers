import { useState, useEffect, useCallback } from 'react'
import { apiClient, KilometersApiClient } from '@/lib/api-client'

const API_KEY_STORAGE_KEY = 'kilometers_api_key'

export interface AuthState {
  apiKey: string | null
  isAuthenticated: boolean | null
  isLoading: boolean
  error: string | null
}

// Custom hook for API key authentication management
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    apiKey: null,
    isAuthenticated: null,
    isLoading: true,
    error: null
  })

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (storedApiKey) {
      setAuthState(prev => ({ 
        ...prev, 
        apiKey: storedApiKey,
        isLoading: false 
      }))
      
      // Set the API key in the client and test authentication
      apiClient.setApiKey(storedApiKey)
      testAuthentication(storedApiKey)
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false 
      }))
    }
  }, [])

  // Test API key authentication
  const testAuthentication = useCallback(async (apiKey: string) => {
    try {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null 
      }))

      apiClient.setApiKey(apiKey)
      const isValid = await apiClient.testAuthentication()
      
      setAuthState(prev => ({ 
        ...prev, 
        isAuthenticated: isValid,
        isLoading: false,
        error: isValid ? null : 'API key authentication failed'
      }))

      return isValid
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication test failed'
      setAuthState(prev => ({ 
        ...prev, 
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      }))
      return false
    }
  }, [])

  // Set and persist API key
  const setApiKey = useCallback(async (newApiKey: string): Promise<boolean> => {
    // Basic client-side validation
    if (!KilometersApiClient.isValidApiKeyFormat(newApiKey)) {
      setAuthState(prev => ({ 
        ...prev, 
        error: 'Invalid API key format'
      }))
      return false
    }

    // Test the API key
    const isValid = await testAuthentication(newApiKey)
    
    if (isValid) {
      // Store in localStorage and update state
      localStorage.setItem(API_KEY_STORAGE_KEY, newApiKey)
      setAuthState(prev => ({ 
        ...prev, 
        apiKey: newApiKey,
        isAuthenticated: true,
        error: null
      }))
    }

    return isValid
  }, [testAuthentication])

  // Clear API key and logout
  const logout = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
    apiClient.setApiKey('')
    setAuthState({
      apiKey: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }, [])

  // Retry authentication with current API key
  const retryAuthentication = useCallback(async () => {
    if (authState.apiKey) {
      return await testAuthentication(authState.apiKey)
    }
    return false
  }, [authState.apiKey, testAuthentication])

  // Clear error state
  const clearError = useCallback(() => {
    setAuthState(prev => ({ 
      ...prev, 
      error: null 
    }))
  }, [])

  return {
    // State
    apiKey: authState.apiKey,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Actions
    setApiKey,
    logout,
    retryAuthentication,
    clearError,
    
    // Utilities
    isValidApiKeyFormat: KilometersApiClient.isValidApiKeyFormat
  }
}

// Helper hook for components that need authenticated API access
export function useAuthenticatedApi() {
  const auth = useAuth()
  
  // Return authenticated API client or null
  const authenticatedClient = auth.isAuthenticated && auth.apiKey 
    ? (() => {
        const client = new KilometersApiClient(auth.apiKey)
        return client
      })()
    : null

  return {
    ...auth,
    apiClient: authenticatedClient
  }
} 