import axios from 'axios';

export const addMember = async (data) => {
  await axios.post(process.env.REACT_APP_API + '/member', data, { withCredentials: true });
};

export const listMember = async () => {
  return await axios.get(process.env.REACT_APP_API + '/member', { withCredentials: true });
};

export const reprintReceipt = async (data) => {
  await axios.post(process.env.REACT_APP_API + '/reprintReceipt', data, { withCredentials: true });
};

export const listreprintReceipt = async () => {
  return await axios.get(process.env.REACT_APP_API + '/reprintReceipt', { withCredentials: true });
};

export const register = async (data) => {
  await axios.post(process.env.REACT_APP_API + '/register', data); // ไม่ต้องส่ง cookie ก็ได้
};

export const login = async (data) => {
  return await axios.post(process.env.REACT_APP_API + '/login', data, { withCredentials: true });
};

export const logout = async () => {
  return await axios.post(process.env.REACT_APP_API + '/logout', {}, { withCredentials: true });
};