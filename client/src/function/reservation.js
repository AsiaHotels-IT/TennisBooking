import axios from 'axios';

export const getReservations = async ()=>
    await axios.get(process.env.REACT_APP_API + '/reservation');