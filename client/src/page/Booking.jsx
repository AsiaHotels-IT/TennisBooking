import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { getReservations, getReservationById, updateReservations, deleteReservations } from '../function/reservation';
import Reservation from '../page/Reservation';
import logo from '../img/logo.png'; 
import { Modal, Box, Button, RadioGroup, FormControlLabel, Radio, TextField } from '@mui/material';
import generatePayload from 'promptpay-qr';
import {QRCodeCanvas}  from 'qrcode.react';  
import { useNavigate } from 'react-router-dom'; 
import './Booking.css'; 
import { reprintReceipt } from '../function/auth';
import auditIcon from '../img/audit.png'

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const mapReservationsToEvents = (reservations) => {
  return reservations.map(resv => {
    const [day, month, year] = resv.reservDate.split('/');
    const startDateTime = new Date(year, month - 1, day, ...resv.startTime.split(':'));
    const endDateTime = new Date(year, month - 1, day, ...resv.endTime.split(':'));

    return {
      id: resv.reservID,
      title: `${resv.cusName} (${resv.paymentMethod})`,
      start: startDateTime,
      end: endDateTime,
      paymentMethod: resv.paymentMethod
    };
  });
};

const formats = {
  timeGutterFormat: 'HH:mm',
  eventTimeRangeFormat: ({ start, end }, culture, local) =>
    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
};

const Booking = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);  // เก็บวันที่คลิกเลือก
  const [selectedEvent, setSelectedEvent] = useState(null); // เพิ่มสำหรับ event ที่คลิก
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [newStart, setNewStart] = useState(null);
  const [newEnd, setNewEnd] = useState(null);
  const [paymentType, setPaymentType] = useState('โอนผ่านธนาคาร'); // 'เงินสด' หรือ 'โอนผ่านธนาคาร'
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isReprintOpen, setIsReprintOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [reprintCode, setReprintCode] = useState("");
  const [paymentPromptPayID, setPaymentPromptPayID] = useState('0946278508');
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState(null); 
  const [searchText, setSearchText] = useState("");
  const [matchingEvents, setMatchingEvents] = useState([]);
  const [showSearchList, setShowSearchList] = useState(false);
  const calendarRef = useRef(null);

  // สร้าง payload promptpay qr ตามเบอร์และจำนวนเงิน
  const qrPayload = generatePayload(paymentPromptPayID, { amount: paymentAmount });

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await getReservations();
        const mappedEvents = mapReservationsToEvents(res.data);
        setEvents(mappedEvents);
      } catch (error) {
        console.error('Error loading reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  useEffect(() => {
    if (!searchText) {
      setMatchingEvents([]);
      setShowSearchList(false);
      return;
    }
    // กรองชื่อที่มีใน events
    const matched = events.filter(ev =>
      ev.title.toLowerCase().includes(searchText.toLowerCase())
    );
    setMatchingEvents(matched);
    setShowSearchList(matched.length > 0);
  }, [searchText, events]);

  const handleSelectSearchEvent = (ev) => {
    setDate(ev.start);    // เลื่อนไปวันนั้น
    setView('day');       // เปลี่ยนเป็นมุมมองรายวัน
    setShowSearchList(false);
    setSearchText("");    // clear ช่องค้นหา (หรือคงไว้ก็ได้)
  };

   // เปลี่ยนเงินสด คำนวณเงินทอนทันที
  useEffect(() => {
    if (paymentType === 'เงินสด') {
      const c = Number(cashReceived) - Number(paymentAmount);
      setChange(isNaN(c) ? 0 : c);
    }
  }, [cashReceived, paymentAmount, paymentType]);

  const EventWrapper = ({ event, children }) => (
    <div
      onContextMenu={async e => {
      e.preventDefault();
      setContextMenu({
        mouseX: e.clientX - 2,
        mouseY: e.clientY - 4,
        eventObj: event
      });
      try {
        const res = await getReservationById(event.id);
        setSelectedEvent(res.data);
      } catch (error) {
        setSelectedEvent(event);
      }
    }}
      style={{ cursor: "pointer" }}
    >
      {children}
    </div>
  );

  // --- ปิด context menu เมื่อคลิกที่อื่น
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    return moment(dateObj).format('DD/MM/YYYY');
  };

  const isPastDate = (dateObj) => {
  if (!dateObj) return true;

    const today = moment().startOf('day');
    const selected = moment(dateObj).startOf('day');

    return selected.isBefore(today);
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
      price: reservation.amount || '-',  // ใช้ราคาจริงถ้ามี
      createAt: moment(reservation.createAt).format('DD/MM/YYYY HH:mm') || '-'

    });
  };

  const printReservationFormContent = ({ cusName, cusTel, selectedDate, startTime, endTime, price, reservID, memID, paymentMethod, reffPerson, createAt }) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
    <html>
      <head>
        <title>ใบจองสนามเทนนิส</title>
        <style>
          @media print {
            @page {
              size: A5 portrait;
              margin: 0;
            }
          }

          body {
            font-family: 'TH Sarabun New', 'Sarabun', sans-serif;
            font-size: 16pt;
            color: #000;
            margin: 0;
            padding: 0;
            background: #fff;
          }

          .container {
            width: 100%;
            max-width: 480px;
            margin: auto;
            padding: 10px;
            box-sizing: border-box;
          }

          .header {
            text-align: center;
            margin-bottom: 20px;
          }

          .header img {
            height: 80px;
            width: auto;
            margin-bottom: 10px;
          }

          .header h2 {
            margin: 0;
            font-size: 18pt;
          }

          .header p {
            margin: 0;
            font-size: 14pt;
          }

          .contact-info {
            margin-top: 5px;
            font-size: 14pt;
          }

          .title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin: 20px 0 10px 0;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 14pt;
            margin-bottom: 10px;
          }

          .reservation-details {
            border: 1px solid #000;
            border-radius: 10px;
            padding: 20px;
            background-color: #fff;
            margin-top: 10px;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .label {
            font-weight: bold;
            color: #000;
          }

          .value {
            color: #000;
          }

          .signature-container {
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
          }

          .signature-block {
            text-align: center;
            width: 40%;
            font-size: 14pt;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logo}" alt="Logo">    
            <h2>โรงแรมเอเชีย</h2>
            <p>296 ถนนพญาไท แขวงถนนเพชรบุรี เขตราชเทวี กรุงเทพมหานคร 10400</p>  
            <div class="contact-info">
              <p><strong>โทรศัพท์:</strong> 02-217-0808 &nbsp; <strong>อีเมล:</strong> booking@asiahotel.co.th</p>
            </div>       
          </div>

          <div class="title">ใบจองสนามเทนนิส</div>

          <div class="info-row">
            <p><strong>หมายเลขการจอง:</strong> 00${reservID}</p>
            <p><strong>วันที่:</strong> ${createAt}</p>
          </div>

          <div class="reservation-details">
            <div class="detail-row"><span class="label">หมายเลขสมาชิก:</span><span class="value">${memID}</span></div>
            <div class="detail-row"><span class="label">ชื่อผู้จอง:</span><span class="value">${cusName}</span></div>
            <div class="detail-row"><span class="label">เบอร์โทร:</span><span class="value">${cusTel || '-'}</span></div>
            <div class="detail-row"><span class="label">วันที่จอง:</span><span class="value">${selectedDate}</span></div>
            <div class="detail-row"><span class="label">เวลา:</span><span class="value">${startTime} - ${endTime}</span></div>
            <div class="detail-row"><span class="label">ราคาทั้งหมด:</span><span class="value">${price || '-'} บาท</span></div>
            <div class="detail-row"><span class="label">สถานะชำระเงิน:</span><span class="value">${paymentMethod}</span></div>
            <div class="detail-row"><span class="label">บุคคลอ้างอิง:</span><span class="value">${reffPerson}</span></div>
          </div>

          <div class="signature-container">
            <div class="signature-block">
              <p>ลงชื่อ....................................</p>
              <p>(พนักงาน)</p>
            </div>

            <div class="signature-block">
              <p>ลงชื่อ....................................</p>
              <p>(ลูกค้า)</p>
            </div>
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

  const handleEventDrop = ({ event, start, end, allDay }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newDate = new Date(start);
    newDate.setHours(0, 0, 0, 0);

    const oldDate = new Date(event.start);
    oldDate.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // ❌ ห้ามย้ายไปก่อนวันนี้
    if (newDate < today) {
      alert("ไม่สามารถย้ายไปวันก่อนวันนี้ได้");
      return;
    }

    // ❌ ห้ามย้ายจากวานนี้มายังวันนี้ หรือวันหลังจากนี้
    const isFromYesterday = oldDate.getTime() === yesterday.getTime();
    const isMoveToTodayOrFuture = newDate.getTime() >= today.getTime();

    if (isFromYesterday && isMoveToTodayOrFuture) {
      alert("ไม่สามารถย้ายจากวานนี้มายังวันนี้หรือวันถัดไปได้");
      return;
    }

    // ✅ ผ่านเงื่อนไขแล้ว
    setDraggedEvent(event);
    setNewStart(start);
    setNewEnd(end);
    setIsModalOpen(true);
  };

  const handleDeleteReservation = async (reservID) => {
    if (!reservID) {
      console.error("❌ ไม่พบ reservID สำหรับลบใบจอง");
      return;
    }
    try {
      await deleteReservations(reservID); // <- ฟังก์ชันที่เรียก axios.delete
      const res = await getReservations();
      const mappedEvents = mapReservationsToEvents(res.data);
      setEvents(mappedEvents);
      window.location.reload(); 
    } catch (error) {
      console.error("ลบใบจองล้มเหลว", error);
    }
  };

  const printReceipt = (reservation, paymentMethod, amount, received, changeVal, receiptDate) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
    <html>
      <head>
        <title>ใบเสร็จรับเงิน</title>
        <style>
          @media print {
            @page {
              size: A5 portrait;
              margin: 0;
            }
          }
    
          body {
            font-family: 'TH Sarabun New', 'Sarabun', sans-serif;
            font-size: 16pt;
            color: #000;
            margin: 0;
            padding: 0;
            background: #fff;
          }
    
          .container {
            width: 100%;
            max-width: 480px;
            margin: auto;
            padding: 10px;
            box-sizing: border-box;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
    
          .header img {
            height: 80px;
            width: auto;
            margin-bottom: 10px;
          }
    
          .header h2 {
            margin: 0;
            font-size: 18pt;
          }
    
          .header p {
            margin: 0;
            font-size: 14pt;
          }
    
          .contact-info {
            margin-top: 5px;
            font-size: 14pt;
          }
    
          .title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin: 20px 0 10px 0;
          }
    
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 14pt;
            margin-bottom: 10px;
          }
    
          .receipt-details {
            border: 1px solid #000;
            border-radius: 10px;
            padding: 20px;
            background-color: #fff;
            margin-top: 5px;
          }
    
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
    
          .label {
            font-weight: bold;
            color: #000;
          }
    
          .value {
            color: #000;
          }
            
          .signature-container {
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
          }
    
          .signature-block {
            text-align: center;
            width: 40%;
            font-size: 14pt;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logo}" alt="Logo">    
            <h2>โรงแรมเอเชีย</h2>
            <p>296 ถนนพญาไท แขวงถนนเพชรบุรี เขตราชเทวี กรุงเทพมหานคร 10400</p>  
            <div class="contact-info">
              <p><strong>โทรศัพท์:</strong> 02-217-0808 &nbsp; <strong>อีเมล:</strong> booking@asiahotel.co.th</p>
            </div>       
          </div>
    
          <div class="title">ใบเสร็จรับเงินสนามเทนนิส</div>
    
          <div class="info-row">
            <p><strong>เลขที่ใบเสร็จ:</strong> ${reservation.receiptNumber || '-'}</p>
            <p><strong>วันที่ออกใบเสร็จ:</strong> ${receiptDate ? new Date(receiptDate).toLocaleString() : '-'}</p>
          </div>
    
          <div class="receipt-details">
            <div class="detail-row"><span class="label">หมายเลขการจอง:</span><span class="value">${reservation.reservID}</span></div>
            <div class="detail-row">
              <span class="label">ชื่อผู้จอง:</span><span class="value" >${reservation.cusName}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span class="label">เบอร์โทร:</span><span class="value">${reservation.cusTel || '-'}</span>
            </div>
            <div class="detail-row"><span class="label">วันที่จอง:</span><span class="value">${reservation.reservDate}</span></div>
            <div class="detail-row"><span class="label">เวลา:</span><span class="value">${reservation.startTime} - ${reservation.endTime}</span></div>
            <div class="detail-row"><span class="label">ยอดที่ต้องชำระ:</span><span class="value">${amount} บาท</span></div>
            <div class="detail-row"><span class="label">วิธีชำระเงิน:</span><span class="value">${paymentMethod}</span></div>
            ${paymentMethod === 'เงินสด' ? `
              <div class="detail-row"><span class="label">จำนวนเงินที่รับ:</span><span class="value">${received} บาท</span></div>
              <div class="detail-row"><span class="label">เงินทอน:</span><span class="value">${changeVal} บาท</span></div>
            ` : ''}
          </div>
            
          <div class="signature-container">
            <div class="signature-block">
              <p>ลงชื่อ....................................</p>
              <p>(ผู้รับเงิน)</p>
            </div>
            
            <div class="signature-block">
              <p>ลงชื่อ....................................</p>
              <p>(ลูกค้า)</p>
            </div>
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

  // ฟังก์ชันชำระเงิน
  const openPaymentModal = (amount, bookingData) => {
    setPaymentAmount(amount);
    setPaymentType('โอนผ่านธนาคาร');
    setCashReceived('');
    setChange(0);
    setPaymentModalOpen(true);

    localStorage.setItem('paymentAmount', amount);
    localStorage.setItem('cusName', bookingData.cusName);
    localStorage.setItem('reservID', bookingData.reservID);
    localStorage.setItem('cusTel', bookingData.cusTel);
    localStorage.setItem('reservDate', bookingData.reservDate);
    localStorage.setItem('startTime', bookingData.startTime);
    localStorage.setItem('endTime', bookingData.endTime);
  };
  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    localStorage.removeItem('paymentAmount');
    localStorage.removeItem('cusName');
    localStorage.removeItem('reservID');
    localStorage.removeItem('cusTel');
    localStorage.removeItem('reservDate');
    localStorage.removeItem('startTime');
    localStorage.removeItem('endTime');
  };

  // ยืนยันการชำระเงิน
  const handleConfirmPayment = async () => {
    if (!selectedEvent) return;

    if (selectedEvent.receiptNumber) {
      alert('รายการนี้ได้ชำระเงินและออกใบเสร็จแล้ว ไม่สามารถชำระซ้ำได้');
      return;
    }
    let method = paymentType;
    let received = null;
    let changeVal = null;
    if (paymentType === 'เงินสด') {
      received = Number(cashReceived);
      changeVal = received - paymentAmount;
      if (isNaN(received) || received < paymentAmount) {
        alert('จำนวนเงินที่รับต้องมากกว่าหรือเท่ากับยอดที่ต้องชำระ');
        return;
      }
    }

    try {
      // สุ่มเลขใบเสร็จเฉพาะถ้ามีการชำระเงินแล้ว (ไม่ใช่ 'ยังไม่ชำระเงิน')
      let receiptNumber = null;
      if (method !== 'ยังไม่ชำระเงิน') {
        receiptNumber = generateReceiptNumber();
      }

      // อัพเดตข้อมูลพร้อมเลขใบเสร็จ (ถ้ามี)
      await updateReservations(selectedEvent.reservID, {
        ...selectedEvent,
        paymentMethod: method,
        receiptNumber, // เพิ่มเลขใบเสร็จเข้าไปในข้อมูล
        receiptDate: new Date(),
        received,
        changeVal,
      });

      setReceiptData({
        ...selectedEvent,
        paymentMethod: method,
        amount: paymentAmount,
        received,
        changeVal,
        receiptNumber,
      });

      setIsReceiptModalOpen(true);
      setPaymentModalOpen(false);

      // รีเฟรชข้อมูลหลังอัพเดต
      const res = await getReservations();
      setEvents(mapReservationsToEvents(res.data));
    } catch (err) {
      alert('บันทึกข้อมูลการชำระเงินล้มเหลว');
    }
  };

  const generateReceiptNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const buttonStyle = {
    padding: '6px 18px',
    fontSize: '18px',
    color: '#65000a',
    backgroundColor: '#d7ba80',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    userSelect: 'none',
    height: '40px',
    fontFamily: '"Noto Sans Thai", sans-serif',
  };

  const handleReprintReceipt = async () => {
    const correctCode = "audit@022170808";

    if (selectedEvent.paymentMethod === 'ยังไม่ชำระเงิน') {
      alert("ยังไม่สามารถรีปริ๊นได้ เนื่องจากยังไม่ชำระเงิน");
      setReprintCode("");
      window.location.reload();
      return;
    }

    if (reprintCode === correctCode) {
      printReceipt(
        selectedEvent,
        selectedEvent.paymentMethod,
        selectedEvent.amount || 0,
        selectedEvent.received || 0,
        selectedEvent.changeVal || 0,
        selectedEvent.receiptDate
      );
      setIsReprintOpen(false);
      setReprintCode("");
      await reprintReceipt({
        reservID: selectedEvent.reservID,
        receiptNumber: selectedEvent.receiptNumber, // <--- เพิ่มเลขที่ใบเสร็จ
        printedAt: new Date()
      });
    } else {
      alert("รหัสยืนยันไม่ถูกต้อง");
    }
  };

  const handleProtectedNavigate = () => {
    const correctCode = "audit@022170808";
  
    if (reprintCode === correctCode) {
      window.open('/reprintReceipt', '_blank');  // เปิดแท็บใหม่
      setIsAuditOpen(false);  // ปิด modal ให้ถูกตัวด้วยนะครับ
      setReprintCode("");
    } else {
      alert("รหัสยืนยันไม่ถูกต้อง");
    }
  };

  // ฟังก์ชันเช็คว่าเป็นวันก่อนหน้าหรือวานนี้ไหม
  const isPastOrYesterday = (dateString) => {
    if (!dateString) return true;
    // dateString ในที่นี้ควรเป็น "DD/MM/YYYY"
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');
    const reservDate = moment(dateString, 'DD/MM/YYYY').startOf('day');
    return reservDate.isBefore(today); // ถ้าเป็นวานหรือวันก่อนหน้า return true
  };

  return (
    <div className='booking-container'>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 20px',
          backgroundColor: '#65000a',
          color: '#fff',
          marginBottom: '20px',
          flexWrap: 'wrap', // ให้รองรับหน้าจอเล็ก
          gap: '10px'
        }}
      >
        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontWeight: '700',
            fontSize: '1.8rem',
            userSelect: 'none',
            letterSpacing: '1px',
            flex: '1 0 auto',
            minWidth: '180px'
          }}
        >
          Tennis Booking
        </h1>
        
        {/* Right Controls */}
        <div
          style={{
            display: 'flex',
            flex: '2',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            minWidth: '300px',
          }}
        >
        {/* Buttons */}
        <button
          onClick={() => navigate("/member")}
          style={buttonStyle}
        >
          เพิ่มสมาชิก
          </button>
          <button
            onClick={() => navigate("/saleReport")}
            style={buttonStyle}
          >
            รายงานยอดขาย
          </button>
          <button
            onClick={() => setIsAuditOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              fontSize: '16px',
              color: '#65000a',
              backgroundColor: '#d7ba80',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              userSelect: 'none',
              height: '40px',
              fontFamily: '"Noto Sans Thai", sans-serif',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
            }}
            className="reprint-button"
          >
            <img src={auditIcon} alt="Audit Icon" style={{ width: 24, height: 24 }} />
          </button>
          {/* Search */}
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้จอง..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                flexGrow: 1,
                minWidth: '200px',
                maxWidth: '250px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: 16,
                fontFamily: 'Noto Sans Thai, sans-serif',
                boxSizing: 'border-box',
              }}
              onFocus={() => setShowSearchList(matchingEvents.length > 0)}
            />
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'row' }}>
        {showSearchList && (
          <div style={{
            position: "absolute",
            top: 50, 
            right: 0,
            zIndex: 99,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 8,
            maxHeight: 300,
            minWidth: 280,
            overflowY: "auto",
            boxShadow: "0 4px 32px rgba(0,0,0,0.13)",
          }}>
            {matchingEvents.length === 0 && <div style={{ padding: 12, color: "#888" }}>ไม่พบรายการ</div>}
            {matchingEvents.map(ev => (
              <div
                key={ev.id + String(ev.start)}
                style={{ padding: 12, cursor: "pointer", borderBottom: "1px solid #eee" }}
                onClick={() => handleSelectSearchEvent(ev)}
              >
                <b>{ev.cusName || ev.title}</b>
                <div style={{ fontSize: 13, color: "#555" }}>
                  {moment(ev.start).format("DD/MM/YYYY HH:mm")} - {moment(ev.end).format("HH:mm")}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{flex:4}}>
          <DragAndDropCalendar
            className='calendar'
            ref={calendarRef}
            localizer={localizer}
            formats={formats}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            views={['day', 'week', 'month']}
            style={{ 
              height: '85vh', 
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
              backgroundColor: '#fff',
              fontFamily: "Noto Sans Thai, sans-serif",
              width: '100%',
              fontSize: '15px',
              whiteSpace: 'pre-line'
            }}
            components={{eventWrapper: EventWrapper,}}
            selectable
            eventPropGetter={(event) => {
              let backgroundColor = '';
              let borderColor = '';
              const now = new Date(); // เวลาปัจจุบัน
              const start = new Date(event.start);
              const end = new Date(event.end);
              // ตรวจสอบว่าเวลาปัจจุบันอยู่ระหว่าง start และ end
              const isCurrent = now >= start && now <= end;

              if (isCurrent) {
                backgroundColor = '#FFD700'; // สีทอง สำหรับ event ที่กำลังเกิดขึ้น
                borderColor = '#FFA000';
              } else if (event.paymentMethod === 'ยังไม่ชำระเงิน') {
                backgroundColor = '#FF5722';
                borderColor = '#d84315';
              } else {
                backgroundColor = '#4CAF50';
                borderColor = '#388e3c';
              }
            
              return {
                style: {
                  backgroundColor,
                  color: 'white',
                  border: `2px solid ${borderColor}`,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                  fontSize: '14px',
                  transition: 'transform 0.2s',
                }
              }
            }}
            onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
            onSelectEvent={async (event) => {
              setSelectedDate(event.start);
              try {
                const res = await getReservationById(event.id);
                setSelectedEvent(res.data);
              } catch (error) {
                console.error("โหลดข้อมูลใบจองล้มเหลว", error);
              }
            }}
            onEventDrop={handleEventDrop}
          />
          
          {contextMenu && selectedEvent && (
            <div style={{ marginTop: 10, display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => printReservationForm(selectedEvent)}
                style={{
                  padding: '6px 18px',
                  fontSize: '18px',
                  color: '#65000a',
                  backgroundColor: '#d7ba80',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  userSelect: 'none',
                  height: '40px',
                  fontFamily: '"Noto Sans Thai", sans-serif',
                }}
                
              >
                ดูใบจอง
              </button>
              {!isPastOrYesterday(selectedEvent.reservDate) && (
                <>
                  <button
                    onClick={() => setIsCancelOpen(true)}
                    style={{
                      padding: '6px 18px',
                      fontSize: '18px',
                      color: '#65000a',
                      backgroundColor: '#d7ba80',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                      userSelect: 'none',
                      height: '40px',
                      fontFamily: '"Noto Sans Thai", sans-serif',
                    }}
                  >
                    ยกเลิกใบจอง
                  </button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => openPaymentModal(Number(selectedEvent.amount), selectedEvent)}
                    style={{
                      padding: '6px 18px',
                      fontSize: '18px',
                      color: '#65000a',
                      backgroundColor: '#d7ba80',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                      userSelect: 'none',
                      height: '40px',
                      fontFamily: '"Noto Sans Thai", sans-serif',
                    }}
                  >
                    ชำระเงิน
                  </Button>
                </>
              )}
              <Button
                  onClick={() => setIsReprintOpen(true)}  // เปิด Modal
                  style={{
                  padding: '6px 18px',
                  fontSize: '18px',
                  color: '#65000a',
                  backgroundColor: '#d7ba80',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  userSelect: 'none',
                  height: '40px',
                  fontFamily: '"Noto Sans Thai", sans-serif',
                }}
                >
                  รีปริ๊นใบเสร็จ
                </Button>
            </div>
          )}
          <Modal open={isAuditOpen} onClose={() => setIsAuditOpen(false)}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              boxShadow: 24,
              width: 400
            }}>
              <h2>Audit</h2>
              <p>กรุณากรอกรหัสยืนยัน:</p>
              <input
                type="password"
                value={reprintCode}
                onChange={(e) => setReprintCode(e.target.value)} // แก้ตรงนี้ ให้ set state ตัวถูกต้อง
                style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                autoFocus
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => {
                  setIsAuditOpen(false);
                  setReprintCode('');
                }}>
                  ยกเลิก
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProtectedNavigate}
                >
                  ยืนยัน
                </Button>
              </Box>
            </Box>
          </Modal>
          <Modal open={isReprintOpen} onClose={() => setIsReprintOpen(false)}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              boxShadow: 24,
              width: 400
            }}>
              <h2>รีปริ๊นใบเสร็จ</h2>
              <p>กรุณากรอกรหัสยืนยัน:</p>
              <input
                type="password"
                value={reprintCode}
                onChange={(e) => setReprintCode(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '16px' }}
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => setIsReprintOpen(false)}>ยกเลิก</Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleReprintReceipt}
                >
                  ยืนยัน
                </Button>
              </Box>
            </Box>
          </Modal>
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              boxShadow: 24,
              width: 400
            }}>
              <h2>ยืนยันการเปลี่ยนแปลง</h2>
              <p><strong>เลขใบจอง:</strong> {draggedEvent?.id}</p>
              <p><strong>เวลาเดิม:</strong> {moment(draggedEvent?.start).format('DD/MM/YYYY HH:mm')} - {moment(draggedEvent?.end).format('HH:mm')}</p>
              <p><strong>เวลาใหม่:</strong> {moment(newStart).format('DD/MM/YYYY HH:mm')} - {moment(newEnd).format('HH:mm')}</p>
              <p style={{color: 'red'}}><strong>กรุณาเรียกเก็บใบจองเดิมจากลูกค้า</strong></p>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    try {
                      const updatedData = {
                        reservID: draggedEvent.id,
                        startTime: moment(newStart).format('HH:mm'),
                        endTime: moment(newEnd).format('HH:mm'),
                        reservDate: moment(newStart).format('DD/MM/YYYY'),
                      };
                      await updateReservations(draggedEvent.id, updatedData);
                      const res = await getReservations();
                      const mappedEvents = mapReservationsToEvents(res.data);
                      setEvents(mappedEvents);
                      setIsModalOpen(false);
                      window.location.reload(); // รีเฟรชหน้าเพื่อแสดงข้อมูลล่าสุด
                    } catch (error) {
                      console.error("อัปเดตล้มเหลว", error);
                    }
                  }}
                >
                  ยืนยัน
                </Button>
              </Box>
            </Box>
          </Modal>
          <Modal open={isCancelOpen} onClose={() => setIsCancelOpen(false)}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              boxShadow: 24,
              width: 400
            }}>
              <h2>ยืนยันการยกเลิกใบจอง</h2>
              <p><strong>เลขใบจอง:</strong> {selectedEvent?.reservID}</p>
              <p><strong>วันเวลา:</strong> {moment(selectedEvent?.start).format('DD/MM/YYYY HH:mm')} - {moment(selectedEvent?.end).format('HH:mm')}</p>
              <p style={{ color: 'red' }}><strong>คุณแน่ใจหรือไม่ว่าต้องการลบใบจองนี้?</strong></p>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => setIsCancelOpen(false)}>ยกเลิก</Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    if (selectedEvent?.reservID) {
                      handleDeleteReservation(selectedEvent.reservID);
                      setIsCancelOpen(false);
                    } else {
                      console.error("ไม่พบ reservID ใน selectedEvent");
                    }
                  }}
                >
                  ยืนยันลบ
                </Button>
              </Box>
            </Box>
          </Modal>
          <Modal
            open={paymentModalOpen}
            onClose={closePaymentModal}
            aria-labelledby="payment-modal-title"
            aria-describedby="payment-modal-description"
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 340,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                textAlign: 'center'
              }}
            >
              <h2>เลือกวิธีชำระเงิน</h2>
              <RadioGroup
                row
                value={paymentType}
                onChange={e => setPaymentType(e.target.value)}
                sx={{ justifyContent: 'center', mb: 2 }}
              >
                <FormControlLabel value="โอนผ่านธนาคาร" control={<Radio />} label="โอนผ่านธนาคาร" />
                <FormControlLabel value="เงินสด" control={<Radio />} label="เงินสด" />
              </RadioGroup>
              <p>ยอดชำระ {paymentAmount} บาท</p>
              {paymentType === 'โอนผ่านธนาคาร' && (
                <>
                  <QRCodeCanvas value={qrPayload} size={220} />
                  <div style={{ margin: '10px 0 0 0', fontSize: 13 }}>พร้อมเพย์: {paymentPromptPayID}</div>
                </>
              )}
              {paymentType === 'เงินสด' && (
                <div style={{ marginTop: 16 }}>
                  <TextField
                    label="จำนวนเงินที่รับ"
                    type="number"
                    value={cashReceived}
                    onChange={e => setCashReceived(e.target.value)}
                    InputProps={{ inputProps: { min: paymentAmount } }}
                    sx={{ width: 180 }}
                  />
                  <div style={{ marginTop: 10, fontSize: 15 }}>
                    เงินทอน: <b>{change}</b> บาท
                  </div>
                </div>
              )}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={closePaymentModal}>ยกเลิก</Button>
                <Button
                  variant="contained" color="success"
                  onClick={handleConfirmPayment}
                >ยืนยัน</Button>
              </Box>
            </Box>
          </Modal>
          <Modal open={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)}>
            <Box sx={{ p: 3 , backgroundColor: 'white', borderRadius: 2, boxShadow: 24, width: 400, margin: 'auto', marginTop: '10%' }}>
              <h2>ใบเสร็จรับเงิน</h2>
              {receiptData && (
                <div>
                  <div>เลขที่ใบจอง: {receiptData.reservID}</div>
                  <div>ชื่อผู้จอง: {receiptData.cusName}</div>
                  <div>ยอดที่ชำระ: {receiptData.amount} บาท</div>
                  <div>วิธีชำระเงิน: {receiptData.paymentMethod}</div>
                  {receiptData.paymentMethod === 'เงินสด' && (
                    <>
                      <div>จำนวนเงินที่รับ: {receiptData.received} บาท</div>
                      <div>เงินทอน: {receiptData.changeVal} บาท</div>
                    </>
                  )}
                  <Button sx={{ mt: 2 }} variant="contained" onClick={() => {
                    printReceipt(receiptData, receiptData.paymentMethod, receiptData.amount, receiptData.received, receiptData.changeVal);
                    setIsReceiptModalOpen(false);
                  }}>พิมพ์ใบเสร็จ (A5)</Button>
                </div>
              )}
            </Box>
          </Modal>
        </div>
        <div style={{ 
            flex: 1, 
            padding: '25px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
            borderRadius: '12px', 
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
            backgroundColor: '#fff' 
          }}>
          {isPastDate(selectedDate) ? (
            <p style={{ color: 'red' }}>ไม่สามารถจองวันย้อนหลังได้</p>
          ) : (
            <Reservation selectedDate={formatDate(selectedDate)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
