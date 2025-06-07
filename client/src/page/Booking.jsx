import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Booking.css'; 
import Reservation from './Reservation';

const Booking = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());

  const formatDateToDDMMYYYY = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มที่ 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
 };

 const formattedDate = formatDateToDDMMYYYY(date);
  return (
    <div>
        <h1>จองสนามเทนนิส</h1>
        <div style={{ justifyContent: 'space-evenly', display: 'flex'}}>
            <div>
                <div className='calendar-container'>
                  <Calendar onChange={setDate} value={date} className="custom-calendar"/>
                </div>
                <p className='text-center'>
                  <span className='bold'>Selected Date:</span>
                  {formatDateToDDMMYYYY(date)}
                </p>
            </div>
            <div>
                <Reservation selectedDate={formattedDate}/>
            </div>
        </div>       
    </div>
  )
}

export default Booking