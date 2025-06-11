import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { addMember } from '../function/auth';
import Search from './Search';

const Member = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cusName: '',
    cusTel: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addMember(formData);
    window.location.reload();
  };

  return (
    <div style={{padding: '10px'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>สมัครสมาชิก</h2>
        <button 
          onClick={() => navigate('/')}  
          style={{
            height: '35px',
            padding: '0 15px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          กลับไปที่หน้าจอง
        </button>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'row', gap: '15px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>ชื่อ:</label>
          <input 
            type="text" 
            name="cusName" 
            value={formData.cusName} 
            onChange={handleChange} 
            required 
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
          />
        </div>
          
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>เบอร์โทรศัพท์:</label>
          <input 
            type="tel" 
            name="cusTel" 
            value={formData.cusTel} 
            onChange={handleChange} 
            required 
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
          />
        </div>
          
        <button 
          type="submit" 
          style={{
            marginTop: '20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            height: '35px'
          }}
        >
          สมัครสมาชิก
        </button>
      </form>
      <div>
        <Search/>
      </div>
    </div>
  )
}

export default Member