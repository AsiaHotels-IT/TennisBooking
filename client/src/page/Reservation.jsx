import React, { useState, useEffect } from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { useNavigate } from 'react-router-dom';

const Reservation = ({ selectedDate }) => {
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');
  const [paymentMethod, setPaymentMethod] = useState('เงินสด');
  const [price, setPrice] = useState(0);
  const [error, setError] = useState('');
  const [pickup, setPickup] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (startTime && endTime) {
      const hours = calculateHours(startTime, endTime);
      if (hours <= 0) {
        setPrice(0);
        setError('กรุณาเลือกเวลาที่ถูกต้อง (เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น)');
      } else {
        setPrice(hours * 200);
        setError('');
      }
    }
  }, [startTime, endTime]);

  const calculateHours = (start, end) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    const diffMinutes = endTotal - startTotal;
    return diffMinutes > 0 ? diffMinutes / 60 : 0;
  };

  const cashup = (pickup) => {
    const change = pickup - price;
    if (change < 0) {
      alert('จำนวนเงินที่รับไม่เพียงพอ');
    } else {
      alert(`เงินทอน: ${change} บาท`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2>รายละเอียดการจอง</h2>
          {selectedDate ? (
            <p>วันที่จอง: {selectedDate}</p>
          ) : (
            <p>ไม่ได้รับวันที่จากหน้าก่อนหน้า</p>
          )}
        </div>
        <div>
          <button onClick={() => navigate("/member")}>สมัครสมาชิก</button>
        </div>
      </div>
      

      <form>
        <label>หมายเลขสมาชิก (ถ้ามี) : 
          <input type="text" />
        </label><br />
        <label>ชื่อลูกค้า : 
          <input type="text" />
        </label><br />
        <label>เบอร์ติดต่อ : 
          <input type="tel" />
        </label><br />
        <label>บุคคลอ้างอิง (ถ้ามี) : 
          <input type="text" />
        </label><br />
        <div style={{ display:'flex' , flexDirection:'row', justifyContent:'space-evenly', marginTop: '20px', marginBottom: '20px'}}>
          <label>
          เวลาเริ่ม:
            <TimePicker
              onChange={setStartTime}
              value={startTime}
              format="HH:mm"
              disableClock={true}
              hourPlaceholder="hh"
              minutePlaceholder="mm"
              minTime="00:00"
              maxTime="23:30"
              clearIcon={null}
              required
            />
          </label>
          <br />
          <label>
            เวลาสิ้นสุด:
            <TimePicker
              onChange={setEndTime}
              value={endTime}
              format="HH:mm"
              disableClock={true}
              hourPlaceholder="hh"
              minutePlaceholder="mm"
              minTime="00:00"
              maxTime="23:30"
              clearIcon={null}
              required
            />
          </label>
        </div>
        {error && (
          <p style={{ color: 'red', marginTop: '8px' }}>
            {error}
          </p>
        )}

        <div>
          
    </div>
  </form>
</div>
);

};

export default Reservation;
