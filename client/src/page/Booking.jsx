import React, { useState, useEffect } from 'react';
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
  const [paymentPromptPayID, setPaymentPromptPayID] = useState('0946278508');
  const navigate = useNavigate();

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

   // เปลี่ยนเงินสด คำนวณเงินทอนทันที
  useEffect(() => {
    if (paymentType === 'เงินสด') {
      const c = Number(cashReceived) - Number(paymentAmount);
      setChange(isNaN(c) ? 0 : c);
    }
  }, [cashReceived, paymentAmount, paymentType]);

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  // ฟังก์ชันแปลง Date เป็น string แบบ DD/MM/YYYY (ถ้าต้องการ)
  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    return moment(dateObj).format('DD/MM/YYYY');
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

  const handleEventDrop = async ({ event, start, end }) => {
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

  const printReceipt = (reservation, paymentMethod, amount, received, changeVal) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>ใบเสร็จรับเงินสนามเทนนิส</title>
          <style>
            @media print {
              @page { size: A5 portrait; margin: 10mm; }
            }
            body { font-family: 'Noto Sans Thai', sans-serif; font-size: 11pt; color: #000; margin: 0; padding: 0; }
            .container { border: 2px solid black; box-sizing: border-box; width: 100vw; height: 100vh; padding: 20px; }
            .header { display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
            .header img { height: 40px; margin-right: 10px; }
            .header h2 { margin: 0; font-size: 14pt; }
            table { width: 100%; font-size: 11pt; border-collapse: collapse; }
            td { padding: 6px 4px; vertical-align: top; line-height: 1.4; }
            .signature { margin-top: 20px; text-align: right; padding-right: 20px; font-size: 11pt; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logo}" alt="Logo">
              <h2>ใบเสร็จรับเงินสนามเทนนิส</h2>
            </div>
            <table>
               <tr><td><strong>เลขที่ใบเสร็จ:</strong></td><td>${reservation.receiptNumber || '-'}</td></tr>
               <tr><td><strong>วันที่ออกใบเสร็จ:</strong></td><td>${reservation.receiptDate ? new Date(reservation.receiptDate).toLocaleString() : '-'}</td></tr>
              <tr><td><strong>หมายเลขการจอง:</strong></td><td>${reservation.reservID}</td></tr>
              <tr><td><strong>ชื่อผู้จอง:</strong></td><td>${reservation.cusName}</td></tr>
              <tr><td><strong>เบอร์โทร:</strong></td><td>${reservation.cusTel || '-'}</td></tr>
              <tr><td><strong>วันที่จอง:</strong></td><td>${reservation.reservDate}</td></tr>
              <tr><td><strong>เวลา:</strong></td><td>${reservation.startTime} - ${reservation.endTime}</td></tr>
              <tr><td><strong>ยอดที่ต้องชำระ:</strong></td><td>${amount} บาท</td></tr>
              <tr><td><strong>วิธีชำระเงิน:</strong></td><td>${paymentMethod}</td></tr>
              ${paymentMethod === 'เงินสด' ? 
                `<tr><td><strong>จำนวนเงินที่รับ:</strong></td><td>${received} บาท</td></tr>
                 <tr><td><strong>เงินทอน:</strong></td><td>${changeVal} บาท</td></tr>` : ''}
            </table>
            <div class="signature">
              <p>ลงชื่อ.................................................</p>
              <p>(ผู้รับเงิน)</p>
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
  const openPaymentModal = (amount) => {
    setPaymentAmount(amount);
    setPaymentType('โอนผ่านธนาคาร');
    setCashReceived('');
    setChange(0);
    setPaymentModalOpen(true);
  };
  const closePaymentModal = () => setPaymentModalOpen(false);

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
        receiptDate: new Date()
      });

      setReceiptData({
        ...selectedEvent,
        paymentMethod: method,
        amount: paymentAmount,
        received,
        changeVal,
        receiptNumber
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
  fontSize: '14px',
  color: '#fff',
  backgroundColor: '#388e3c',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(56, 142, 60, 0.4)',
  transition: 'background-color 0.3s ease',
  userSelect: 'none',
};

  return (
    <div style={{  justifyContent: 'space-evenly', display: 'flex', padding: 20 }} className='booking-container'>
      
      <div style={{ flex: 4 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '15px 20px', 
          backgroundColor: '#2e7d32', 
          borderRadius: '10px', 
          boxShadow: '0 3px 10px rgba(46, 125, 50, 0.3)',
          color: '#fff',
          marginBottom: '20px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}>
          <h1 style={{ 
            margin: 0, 
            fontWeight: '700', 
            fontSize: '1.8rem',
            userSelect: 'none',
            letterSpacing: '1px',
          }}>
            ปฏิทินจองสนามเทนนิส
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => navigate("/member")} 
              style={buttonStyle}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1b4d22'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#388e3c'}
            >
              เพิ่มสมาชิก
            </button>
            <button 
              onClick={() => navigate("/saleReport")} 
              style={buttonStyle}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1b4d22'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#388e3c'}
            >
              รายงานยอดขาย
            </button>
          </div>
        </div>
        
        <DragAndDropCalendar
          className='calendar'
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
            //height: 600, 
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
            backgroundColor: '#fff',
            fontFamily: "Noto Sans Thai, sans-serif",
            width: '100%',
            fontSize: '15px',
            whiteSpace: 'pre-line'
          }}
          selectable
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
        {selectedEvent && (
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => printReservationForm(selectedEvent)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer'
              }}
            >
              ดูใบจอง (A5)
            </button>
            <button
              onClick={() => setIsCancelOpen(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer'
              }}
            >
              ยกเลิกใบจอง
            </button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => openPaymentModal(Number(selectedEvent.amount))}
            >ชำระเงิน
            </Button>
          </div>
        )}
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
      <div style={{ marginTop: 20 }}>
        <Reservation selectedDate={formatDate(selectedDate)} />
      </div>
    </div>
  );
};

export default Booking;
