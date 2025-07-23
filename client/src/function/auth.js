import axios from 'axios';

export const addMember = async (data) =>{
    await axios.post(process.env.REACT_APP_API + '/member', data)
}

export const listMember = async()=>{
   return await axios.get(process.env.REACT_APP_API + '/member')
}

export const reprintReceipt = async(data)=>{
    await axios.post(process.env.REACT_APP_API + '/reprintReceipt', data)
}

export const listreprintReceipt = async()=>{
    return await axios.get(process.env.REACT_APP_API + '/reprintReceipt', )
}

export const register = async(data)=>{
    await axios.post(process.env.REACT_APP_API + '/register', data)
}

export const login = async(data)=>{
    await axios.post(process.env.REACT_APP_API + '/login', data)
}