import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../function/auth';

const Header = ({ title = "โรงแรมเอเชีย - ระบบจองสนามเทนนิส" }) => {
  const navigate = useNavigate();
  
  // ดึงข้อมูล user จาก localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout on client side even if server error
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px', 
      backgroundColor: '#65000a', 
      padding: '20px',
      fontFamily: 'Noto Sans Thai, sans-serif'
    }}>
      <h2 style={{ margin: 0, color: '#fff' }}>{title}</h2>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#d7ba80', fontSize: '16px' }}>
            ยินดีต้อนรับ: {user.username} ({user.role === 'cashier' ? 'แคชเชียร์' : 'ผู้ตรวจสอบ'})
          </span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '6px 18px',
              fontSize: '16px',
              color: '#65000a',
              backgroundColor: '#d7ba80',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              userSelect: 'none',
              height: '36px',
              fontFamily: 'Noto Sans Thai, sans-serif'
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;