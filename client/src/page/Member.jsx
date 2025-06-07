import React from 'react'
import { useNavigate } from 'react-router-dom'

const Member = () => {
  const navigate = useNavigate();

  return (
    <div>
      Member
      <button onClick={() => navigate('/')}>Back to Booking</button>
    </div>
  )
}

export default Member