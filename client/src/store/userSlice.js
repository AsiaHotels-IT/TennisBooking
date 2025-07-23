import { createSlice } from '@reduxjs/toolkit'

const   initialState = {
    value: 'Asia Tennis Stadium',
    user: "Guest"
}
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: state => {
      state.value = "login"
      state.user = "User"
    },
    logout: state => {
      state.value = "logout"
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    }
  }
})

export const { login, logout, incrementByAmount } = userSlice.actions

export default userSlice.reducer