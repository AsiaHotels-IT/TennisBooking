import React, { useState, useEffect, useRef } from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { useNavigate } from 'react-router-dom';
import { createReservations } from '../function/reservation';
import logo from '../img/logo.png'; 

const Reservation = ({ selectedDate }) => {
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');
  const [paymentMethod, setPaymentMethod] = useState('เงินสด');
  const [price, setPrice] = useState(0);
  const [error, setError] = useState('');
  const [pickup, setPickup] = useState(0);
  const navigate = useNavigate();
  const [memberID, setMemberID] = useState('');
  const [cusName, setCusName] = useState('');
  const [cusTel, setCusTel] = useState('');
  const [refPerson, setRefPerson] = useState('');
  const calendarRef = useRef();

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

  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        memberID,
        cusName,
        cusTel,
        refPerson,
        reservDate: selectedDate,
        startTime,
        endTime,
        price,  // เพิ่มตรงนี้
      };

      const response = await createReservations(payload);

      alert('จองสนามสำเร็จ');
      printReservationForm({
        cusName,
        cusTel,
        reservDate: selectedDate,
        startTime,
        endTime,
        price, // ใช้ราคาที่คำนวณใน frontend แทน response.data.amount
        reservID: response.data.reservID,
        memberID: response.data.memberID,
        paymentMethod: response.data.paymentMethod,
        refPerson: response.data.refPerson,
      });
      window.location.reload();

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('มีการจองในเวลานั้นแล้ว กรุณาเลือกเวลาอื่น');
      }
    }
  };

  const printReservationForm = (reservation) => {
      const reservDate = reservation.reservDate;
      const startTime = reservation.startTime;
      const endTime = reservation.endTime;
  
      printReservationFormContent({
        reservID: reservation.reservID,
        memID: reservation.memberID || '-',  // ใช้ memberID ถ้ามี
        paymentMethod: reservation.paymentMethod || '-',  // ใช้ paymentMethod ถ้ามี
        reffPerson: reservation.refPerson || '-',  // ใช้ refPerson ถ้ามี
        cusName: reservation.cusName,
        cusTel: reservation.cusTel || '-',
        selectedDate: reservDate,
        startTime,
        endTime,
        price: price || '-',  // ใช้ราคาจริงถ้ามี
  
      });
    };
  
    const printReservationFormContent = ({ cusName, cusTel, selectedDate, startTime, endTime, price, reservID, memID, paymentMethod, reffPerson }) => {
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write(`
        <html>
          <head>
            <title>ใบจองสนามเทนนิส</title>
            <style>
              @media print {
                @page {
                  size: A5 portrait;
                  margin: 10mm;
                }
              }
  
              body {
                font-family: 'Noto Sans Thai', sans-serif;
                font-size: 11pt;
                color: #000;
                margin: 0;
                padding: 0;
              }
  
              .container {
                border: 2px solid black;
                box-sizing: border-box;
                width: 100vw;
                height: 100vh;
                padding: 20px;
              }
              .header {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 12px;
              }
  
              .header img {
                height: 40px;
                margin-right: 10px;
              }
  
              .header h2 {
                margin: 0;
                font-size: 14pt;
              }
  
              table {
                width: 100%;
                font-size: 11pt;
                border-collapse: collapse;
              }
  
              td {
                padding: 6px 4px;
                vertical-align: top;
                line-height: 1.4;
              }
  
              .signature {
                margin-top: 20px;
                text-align: right;
                padding-right: 20px;
                font-size: 11pt;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${logo}" alt="Logo">
                <h2>ใบจองสนามเทนนิส</h2>
              </div>
  
              <table>
                <tr><td><strong>หมายเลขการจอง:</strong></td><td>${reservID}</td></tr>
                <tr><td><strong>หมายเลขสมาชิก:</strong></td><td>${memID}</td></tr>
                <tr><td><strong>ชื่อผู้จอง:</strong></td><td>${cusName}</td></tr>
                <tr><td><strong>เบอร์โทร:</strong></td><td>${cusTel || '-'}</td></tr>
                <tr><td><strong>วันที่จอง:</strong></td><td>${selectedDate}</td></tr>
                <tr><td><strong>เวลา:</strong></td><td>${startTime} - ${endTime}</td></tr>
                <tr><td><strong>ราคาทั้งหมด:</strong></td><td>${price || '-'} บาท</td></tr>
                <tr><td><strong>สถานะชำระเงิน:</strong></td><td>${paymentMethod}</td></tr>
                <tr><td><strong>บุคคลอ้างอิง:</strong></td><td>${reffPerson}</td></tr>
              </table>
  
              <div class="signature">
                <p>ลงชื่อ.................................................</p>
                <p>(ผู้จอง)</p>
              </div>
            </div>
  
            <script>
              window.onload = function () {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
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
          <input type="text" value={memberID} onChange={(e) => setMemberID(e.target.value)}/>
        </label><br />
        <label>ชื่อลูกค้า : 
          <input type="text" value={cusName} onChange={(e) => setCusName(e.target.value)}/>
        </label><br />
        <label>เบอร์ติดต่อ : 
          <input type="tel" value={cusTel} onChange={(e) => setCusTel(e.target.value)}/>
        </label><br />
        <label>บุคคลอ้างอิง (ถ้ามี) : 
          <input type="text" value={refPerson} onChange={(e) => setRefPerson(e.target.value)}/>
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
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={handleAddBooking}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            เพิ่มข้อมูล
          </button>
        </div>
      </form>
    </div>
  );
};

export default Reservation;
