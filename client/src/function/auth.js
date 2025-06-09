import axios from 'axios';

export const addMember = async (data) =>{
    await axios.post(process.env.REACT_APP_API + '/member', data)
}

export const listMember = async()=>{
   return await axios.get(process.env.REACT_APP_API + '/member')
}