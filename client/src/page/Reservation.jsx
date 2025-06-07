import React, { useState, useEffect } from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const Reservation = ({ selectedDate }) => {
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');
  const [paymentMethod, setPaymentMethod] = useState('เงินสด');
  const [price, setPrice] = useState(0);
  const [error, setError] = useState('');
  const [pickup, setPickup] = useState(0);

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
      <h2>รายละเอียดการจอง</h2>
      {selectedDate ? (
        <p>วันที่จอง: {selectedDate}</p>
      ) : (
        <p>ไม่ได้รับวันที่จากหน้าก่อนหน้า</p>
      )}

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

        {error && (
          <p style={{ color: 'red', marginTop: '8px' }}>
            {error}
          </p>
        )}

        <div>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="เงินสด"
              checked={paymentMethod === 'เงินสด'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            เงินสด
          </label>

          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="โอน"
              checked={paymentMethod === 'โอน'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            โอน
          </label>
        </div>

        <p>ราคาที่ต้องชำระ: {price} บาท</p>
        <div>
           {paymentMethod === 'เงินสด' && (
        <div>
          <p>รับเงินจำนวน: 
            <input 
              type="number" 
              value={pickup} 
              onChange={(e) => setPickup(e.target.value)} 
            /> บาท
          </p>
          <button type="submit" onClick={() => cashup(Number(pickup))}>คำนวณเงินทอน</button>
        </div>
      )}

      {paymentMethod === 'โอน' && (
        <div>
          <p>กรุณาชำระเงินผ่าน QR Code PromptPay ด้านล่าง</p>
          {/* ใส่ภาพ QR Code หรือ component QR code ของคุณที่นี่ */}
          <img 
            src="https://tse1.mm.bing.net/th/id/OIP.J7jd7PlYtKEfGRXW8jgX5gHaHn?r=0&rs=1&pid=ImgDetMain" 
            alt="QR Code PromptPay" 
            style={{width: '200px', height: '200px'}} 
          />
          <p>จำนวนเงินที่ต้องโอน: {price} บาท</p>
          <button type='submit'>เสร็จสิ้น</button>
        </div>
      )}
    </div>

  </form>
</div>
);

};

export default Reservation;
