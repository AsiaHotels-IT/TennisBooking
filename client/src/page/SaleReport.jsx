import React, { useEffect, useState, useCallback } from "react";
import { getReservations, listCancelReservation } from "../function/reservation";
import "./SaleReport.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const SaleReport = () => {
  const [reservation, setReservation] = useState([]);
  const [cancelReservation, setCancelReservation] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res1 = await getReservations();
    const res2 = await listCancelReservation();
    setReservation(res1.data);
    setCancelReservation(res2.data);
  };

  const parseDate = (dateStr) => {
    try {
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split("/");
        return new Date(year, month - 1, day);
      } else if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split("-");
        return new Date(year, month - 1, day);
      } else {
        return new Date(dateStr);
      }
    } catch {
      return null;
    }
  };

  const filterData = useCallback((data) => {
    return data.filter((item) => {
      const date = parseDate(item.reservDate);
      if (!date) return false;

      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;

      return true;
    });
  }, [startDate, endDate]);

  const filteredReservation = filterData(reservation);
  const filteredCancelReservation = filterData(cancelReservation);

  const totalBookingCount = filteredReservation.length;
  const totalCancelCount = filteredCancelReservation.length;

  const totalBookingAmount = filteredReservation.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalCancelAmount = filteredCancelReservation.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const netSales = totalBookingAmount;

  const handleCardClick = (type) => {
    setSelectedType(type);
    if (type === "booking") {
      setSelectedData(filteredReservation);
    } else if (type === "cancel") {
      setSelectedData(filteredCancelReservation);
    }
  };

  // เพิ่ม useEffect เพื่อรีเฟรชตารางเมื่อช่วงวันที่เปลี่ยน
  useEffect(() => {
    if (selectedType === "booking") {
      setSelectedData(filteredReservation);
    } else if (selectedType === "cancel") {
      setSelectedData(filteredCancelReservation);
    }
  }, [startDate, endDate, selectedType, filteredReservation, filteredCancelReservation]);

  return (
    <div className="sale-report">
      <div className="page-header">
        <h1>รายงานยอดขาย</h1>
        <button onClick={() => navigate(-1)}>กลับไปหน้าหลัก</button>
      </div>

      <div className="date-filter">
        <div>
          <label>ตั้งแต่: </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="เลือกวันที่เริ่มต้น"
          />
        </div>
        <div>
          <label>ถึง: </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="เลือกวันที่สิ้นสุด"
          />
        </div>
      </div>

      <div className="summary-boxes">
        <div className="box" onClick={() => handleCardClick("booking")}>
          <h3>จำนวนการจองทั้งหมด</h3>
          <p>{totalBookingCount} รายการ</p>
        </div>
        <div className="box" onClick={() => handleCardClick("cancel")}>
          <h3>จำนวนที่ยกเลิก</h3>
          <p>{totalCancelCount} รายการ</p>
        </div>
        <div className="box">
          <h3>ยอดจองทั้งหมด</h3>
          <p>{totalBookingAmount.toLocaleString()} บาท</p>
        </div>
        <div className="box">
          <h3>ยอดที่ถูกยกเลิก</h3>
          <p>{totalCancelAmount.toLocaleString()} บาท</p>
        </div>
        <div className="box box-highlight">
          <h3>ยอดขายสุทธิ</h3>
          <p>{netSales.toLocaleString()} บาท</p>
        </div>
      </div>

      <button onClick={() => window.print()} className="print-button">
        พิมพ์รายงาน
      </button>

      {selectedType && (
        <div className="print-area table-container">
          <h3>รายการ{selectedType === "booking" ? "จอง" : "ยกเลิก"}
            {startDate || endDate ? (
              <>
                {" "}ช่วงวันที่:{" "}
                {startDate ? startDate.toLocaleDateString('th-TH') : "ไม่กำหนด"}  
                {" "}ถึง{" "}
                {endDate ? endDate.toLocaleDateString('th-TH') : "ไม่กำหนด"}
              </>
            ) : null}
          </h3>

          <table>
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>เบอร์โทร</th>
                <th>วันที่</th>
                <th>เวลา</th>
                <th>จำนวนเงิน</th>
                <th>วิธีชำระเงิน</th>
                <th>หมายเลขใบเสร็จ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {selectedData.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.cusName}</td>
                  <td>{item.cusTel}</td>
                  <td>{item.reservDate}</td>
                  <td>{item.startTime} - {item.endTime}</td>
                  <td>{item.amount.toLocaleString()} บาท</td>
                  <td>{item.paymentMethod}</td>
                  <td>{item.receiptNumber || '-'}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const boxStyle = {
  background: "#f4f4f4",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  width: "200px",
  textAlign: "center",
  cursor: "pointer"
};

const boxStyleHighlight = {
  ...boxStyle,
  background: "#d1ffd1",
  border: "2px solid #00aa00"
};

export default SaleReport;
