import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getReservations } from '../function/reservation';
import Reservation from '../page/Reservation';

const localizer = momentLocalizer(moment);

const mapReservationsToEvents = (reservations) => {
  return reservations.map(resv => {
    const [day, month, year] = resv.reservDate.split('/');
    const startDateTime = new Date(year, month - 1, day, ...resv.startTime.split(':'));
    const endDateTime = new Date(year, month - 1, day, ...resv.endTime.split(':'));

    return {
      id: resv.reservID,
      title: `${resv.cusName} (${resv.status})`,
      start: startDateTime,
      end: endDateTime,
    };
  });
};

const Booking = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('day');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);  // เก็บวันที่คลิกเลือก

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

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  // ฟังก์ชันแปลง Date เป็น string แบบ DD/MM/YYYY (ถ้าต้องการ)
  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    return moment(dateObj).format('DD/MM/YYYY');
  };

  return (
    <div style={{ height: 700, justifyContent: 'space-evenly', display: 'flex'}}>
      <div style={{ flex: 3, marginRight: 20 }}>
        <h1>ปฏิทินจองสนามเทนนิส (รายวัน)</h1>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={['day', 'week', 'month']}
          style={{ height: 600, width: '100%' }}

          selectable    // เปิดให้เลือกช่องเวลาได้
          onSelectSlot={(slotInfo) => {
            // slotInfo.start คือวันที่ที่คลิกเลือก
            setSelectedDate(slotInfo.start);
          }}
          onSelectEvent={(event) => {
            // ถ้าคลิก event จะได้ event.start เป็นวันที่เริ่ม
            setSelectedDate(event.start);
          }}
        />
      </div>
      
      <div style={{ marginTop: 20 }}>
        {/* ส่งวันที่ที่คลิกเป็น string formatted ไปให้ Reservation */}
        <Reservation selectedDate={formatDate(selectedDate)} />
      </div>
    </div>
  );
};

export default Booking;
