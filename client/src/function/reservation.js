import axios from 'axios';

export const login = async (data) =>
    await axios.post(process.env.REACT_APP_API + '/reservation', data);
