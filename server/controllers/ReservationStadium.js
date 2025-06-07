const ReservationStadium = require('../model/ReservationStadium')
const Member = require('../model/member')

exports.read = async(req, res)=>{
    try{
        const id = req.params.id
        const thisReserv = await ReservationStadium.findOne({reservID : id}).exec()
        res.send(thisReserv)
    }catch(err){
        console.log(err)
        res.status(500).send('Server Error')
    }
}

exports.list = async (req, res)=>{
    try{
        const allReserv = await ReservationStadium.find({}).exec()
        res.send(allReserv)
    }catch(err){
        console.log(err)
        res.status(500).send('Server Error')
    }
}

exports.create = async (req, res) => {
  try {
    const data = req.body;

    // ตรวจสอบสมาชิก
    if (data.memberID) {
      const member = await Member.findOne({ memberID: data.memberID });
      if (!member) {
        return res.status(400).json({ message: 'ไม่พบรหัสสมาชิกนี้ในระบบ' });
      }
    }
    if (!isFullHourDuration(data.startTime, data.endTime)) {
      return res.status(400).json({ message: 'กรุณาจองเป็นชั่วโมงเต็ม เช่น 10:00 - 11:00, 14:00 - 16:00' });
    }

    // หา reservation ที่วันที่เดียวกัน
    const existingReservations = await ReservationStadium.find({ reservDate: data.reservDate, status: { $ne: 'ยกเลิก' } });

    // ตรวจสอบเวลาซ้อนกัน
    for (const reserv of existingReservations) {
      if (isTimeOverlap(data.startTime, data.endTime, reserv.startTime, reserv.endTime)) {
        return res.status(400).json({ message: 'เวลาจองซ้อนกับการจองอื่นแล้ว' });
      }
    }

    // คำนวณจำนวนชั่วโมง และคิดราคา
    const hours = calculateHours(data.startTime, data.endTime);
    data.amount = hours * 200;

    // สร้างการจองใหม่
    const reserv = await new ReservationStadium(data).save();
    res.send(reserv);

  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const newData = req.body;

    if (newData.memberID) {
      const member = await Member.findOne({ memberID: newData.memberID });
      if (!member) {
        return res.status(400).json({ message: 'ไม่พบรหัสสมาชิกนี้ในระบบ' });
      }
    }

    if (!isFullHourDuration(newData.startTime, newData.endTime)) {
      return res.status(400).json({ message: 'กรุณาจองเป็นชั่วโมงเต็ม เช่น 10:00 - 11:00, 14:00 - 16:00' });
    }   

    // หา reservation ที่วันที่เดียวกันและไม่ใช่ตัวที่กำลังจะอัพเดต
    const existingReservations = await ReservationStadium.find({ 
      reservDate: newData.reservDate, 
      reservID: { $ne: id }, 
      status: { $ne: 'ยกเลิก' } 
    });

    // ตรวจสอบเวลาซ้อนกัน
    for (const reserv of existingReservations) {
      if (isTimeOverlap(newData.startTime, newData.endTime, reserv.startTime, reserv.endTime)) {
        return res.status(400).json({ message: 'เวลาจองซ้อนกับการจองอื่นแล้ว' });
      }
    }

    // คำนวณจำนวนชั่วโมง และคิดราคา
    const hours = calculateHours(newData.startTime, newData.endTime);
    newData.amount = hours * 200;

    // อัพเดตข้อมูล
    const updated = await ReservationStadium.findOneAndUpdate({ reservID: id }, newData, { new: true }).exec();

    if (!updated) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลการจองที่ต้องการแก้ไข' });
    }

    res.send(updated);

  } catch (err) {
    console.log(err);
    res.status(500).send('Cannot Update');
  }
};


exports.remove = async(req,res)=>{
    try{
        const id = req.params.id
        const removed = await ReservationStadium.findOneAndDelete({ reservID : id}).exec()
        res.send('Delete success',removed)
    }catch(err){
        console.log(err)
        res.status(500).send('Cannot Delete')
    }
}

exports.checkAvailability = async (req, res) => {
  try {
    const { reservDate, startTime, endTime } = req.body;

    if (!reservDate || !startTime || !endTime) {
      return res.status(400).json({ message: 'กรุณาระบุ reservDate, startTime และ endTime' });
    }

    // ดึงข้อมูลจองสนามที่ตรงกับวัน reservDate
    const existingReservations = await ReservationStadium.find({ reservDate });

    // ตรวจสอบเวลาซ้อนทับ
    const isOverlap = existingReservations.some(reservation => 
      isTimeOverlap(startTime, endTime, reservation.startTime, reservation.endTime)
    );

    if (isOverlap) {
      return res.json({ available: false, message: 'สนามไม่ว่างในช่วงเวลาที่เลือก' });
    } else {
      return res.json({ available: true, message: 'สนามว่าง' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
  }
};


function isTimeOverlap(start1, end1, start2, end2) {
  return (start1 < end2) && (start2 < end1);
}

function isFullHourDuration(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  const duration = endTotalMinutes - startTotalMinutes;

  return duration > 0 && duration % 60 === 0;
}

function calculateHours(startTime, endTime) {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  const hours = (end - start) / (1000 * 60 * 60); // คำนวณชั่วโมง
  return hours;
}
