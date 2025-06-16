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