import React, { useState, useEffect} from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { createReservations } from '../function/reservation';
import logo from '../img/logo.png'; 

const Reservation = ({ selectedDate }) => {
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');
  const [price, setPrice] = useState(0);
  const [error, setError] = useState('');
  const [memberID, setMemberID] = useState('');
  const [cusName, setCusName] = useState('');
  const [cusTel, setCusTel] = useState('');
  const [refPerson, setRefPerson] = useState('');

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
                <p>(พนักงาน)</p>
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

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#333',
    fontSize: '15px',
    userSelect: 'none',
  };

  const inputStyle = {
    marginTop: '6px',
    padding: '10px 12px',
    width: '100%',
    borderRadius: '6px',
    border: '1.8px solid #ddd',
    fontSize: '15px',
    boxSizing: 'border-box',
    outlineColor: '#4caf50',
    transition: 'border-color 0.3s ease',
  };

  const timePickerStyle = {
    width: '100%',
    marginTop: '6px',
    borderRadius: '6px',
    border: '1.8px solid #ddd',
    padding: '8px',
    fontSize: '15px',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ 
  maxWidth: '500px', 
  margin: '20px auto', 
  padding: '25px', 
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
  borderRadius: '12px', 
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
  backgroundColor: '#fff' 
}}>
  <div style={{ marginBottom: '25px', borderBottom: '2px solid #4caf50', paddingBottom: '8px' }}>
    <h2 style={{ color: '#2e7d32', margin: 0 }}>รายละเอียดการจอง</h2>
    {selectedDate ? (
      <p style={{ color: '#555', fontSize: '14px', marginTop: '5px' }}>
        วันที่จอง: <strong>{selectedDate}</strong>
      </p>
    ) : (
      <p style={{ color: '#999', fontSize: '14px', marginTop: '5px' }}>
        ไม่ได้รับวันที่จากหน้าก่อนหน้า
      </p>
    )}
  </div>

  <form>
    <label style={labelStyle}>
      หมายเลขสมาชิก (ถ้ามี) :
      <input type="text" value={memberID} onChange={(e) => setMemberID(e.target.value)} style={inputStyle} />
    </label>

    <label style={labelStyle}>
      ชื่อลูกค้า :
      <input type="text" value={cusName} onChange={(e) => setCusName(e.target.value)} style={inputStyle} />
    </label>

    <label style={labelStyle}>
      เบอร์ติดต่อ :
      <input type="tel" value={cusTel} onChange={(e) => setCusTel(e.target.value)} style={inputStyle} />
    </label>

    <label style={labelStyle}>
      บุคคลอ้างอิง (ถ้ามี) :
      <input type="text" value={refPerson} onChange={(e) => setRefPerson(e.target.value)} style={inputStyle} />
    </label>

    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '30px 0' }}>
      <label style={{ ...labelStyle, flex: 1, marginRight: '10px' }}>
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
          style={timePickerStyle}
        />
      </label>

      <label style={{ ...labelStyle, flex: 1, marginLeft: '10px' }}>
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
          style={timePickerStyle}
        />
      </label>
    </div>

    {error && (
      <p style={{ color: 'red', marginBottom: '15px', fontWeight: '600' }}>
        {error}
      </p>
    )}

    <div style={{ textAlign: 'center' }}>
      <button
        type="button"
        onClick={handleAddBooking}
        style={{
          padding: '12px 35px',
          fontSize: '17px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.5)',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#388e3c'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4caf50'}
      >
        เพิ่มข้อมูล
      </button>
    </div>
  </form>
</div>
  );
};

export default Reservation;
