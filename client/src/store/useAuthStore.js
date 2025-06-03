import { create } from 'zustand'
import axios from 'axios'
import CryptoJS from 'crypto-js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

// Function to encrypt password
const encryptPassword = (password) => {
  try {
    // Using SHA-256 for one-way hashing
    return CryptoJS.SHA256(password).toString()
  } catch (error) {
    console.error('Error encrypting password:', error)
    return password
  }
}

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signUp: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null })
      
      // Encrypt password before sending
      const encryptedPassword = encryptPassword(password)
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`, 
        {
          name,
          email,
          password: encryptedPassword
        }
      )

      set({ user: response.data.user, isLoading: false })
      return response.data
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during signup'
      set({ 
        error: errorMessage,
        isLoading: false 
      })
      throw new Error(errorMessage)
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null })
      
      // Encrypt password before sending
      const encryptedPassword = encryptPassword(password)
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,  
        {
          email,
          password: encryptedPassword
        }
      )

      set({ user: response.data.user, isLoading: false })
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during signin'
      set({ 
        error: errorMessage,
        isLoading: false 
      })
      throw new Error(errorMessage)
    }
  },

  clearError: () => set({ error: null })
}))

export default useAuthStore 