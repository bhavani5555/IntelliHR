import axios from 'axios'

const candidateApi = axios.create({
  baseURL: 'http://localhost:8080',
})

candidateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('candidate_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default candidateApi
