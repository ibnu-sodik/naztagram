import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { responsiveArray } from 'ant-design-vue/es/_util/responsiveObserve'

export const useUserStore = defineStore('users', () => {
  const user          = ref(null)
  const errorMessage  = ref("")
  const loading       = ref(false)
  const loadingUser   = ref(false)

  // !SECTION Fungsi validasi email
  const validateEmail = (email) => {
    return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  }

  // !SECTION Handle login
  const handleLogin   = async (credentials) => {
    // console.log({credentials})
    const {email, password} = credentials
    if (!validateEmail(email)) {
      return errorMessage.value = "Email is invalid"
    }
    if (!password.length) {
      return errorMessage.value = "Password can not be empty"
    }
    loading.value = true
    const {error} = await supabase.auth.signInWithPassword({
      email, password
    })
    if (error) {
      loading.value = false
      return errorMessage.value = error.message
    }
    const {data: existingUser} = await supabase
      .from("users")
      .select()
      .eq('email', email)
      .single()
    
      user.value = {
        email: existingUser.email,
        username: existingUser.username,
        id: existingUser.id
      }
      loading.value = false
      errorMessage.value = ""
  }

  // !SECTION Handle Signup
  const handleSignup  = async (credentials) => {
    const {email, password, username} = credentials;
    if (password.length < 6) {
      return errorMessage.value = "Password length is too short"
    }
    if (username.length < 4) {
      return errorMessage.value = "Username length is too short"
    }
    if (!validateEmail(email)) {
      return errorMessage.value = "Email is invalid"
    }
    loading.value = true

    // !SECTION Validation if user exists
    const {data: userWithUsername} = await supabase
      .from("users")
      .select()
      .eq('username', username)
      .single()

    if (userWithUsername) {
      loading.value = false
      return errorMessage.value = "Username already exists"
    }
    errorMessage.value = ""
    const {error} = await supabase.auth.signUp({
      email,
      password
    })
    if (error) {
      loading.value = false
      return errorMessage.value = error.message
    }
    await supabase.from("users").insert({
      email,
      username
    })
    const {data: newUser} = await supabase
      .from("users")
      .select()
      .eq('email', email)
      .single()

    user.value = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username
    }
    loading.value = false
  }

  // !SECTION Handle logout
  const handleLogout  = async () => {
    await supabase.auth.signOut()
    user.value = null
  }

  // !SECTION Handle getUser
  const getUser       = async () => {
    loadingUser.value = true
    const {data} = await supabase.auth.getUser()

    if (!data.user) {
      loadingUser.value = false
      return user.value = null
    }

    const {data: userWithEmail} = await supabase.from("users").select().eq("email", data.user.email).single()

    user.value = {
      username: userWithEmail.username,
      email: userWithEmail.email,
      id: userWithEmail.id      
    }
    loadingUser.value = false
  }

  const clearErrorMessage = () => {
    errorMessage.value = ""
  }

  return { 
    user, 
    errorMessage,
    loading,
    loadingUser,
    user,
    handleLogin, 
    handleSignup, 
    handleLogout, 
    getUser,
    clearErrorMessage
  }
})
