import React, {useState, useEffect} from 'react'
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
    navigate('/');
  };

  return (
    <div>
      <div style={{ display: 'flex',  justifyContent: 'space-between'}}>
        <h2>สมัครสมาชิก</h2>
        <button onClick={() => navigate('/')}>กลับไปที่หน้าจอง</button>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'row'}}>
        <label>
          ชื่อ:
          <input type="text" name="cusName" value={formData.cusName} onChange={handleChange} required />
        </label>
        <br />
        <label>
          เบอร์โทรศัพท์:
          <input type="tel" name="cusTel" value={formData.cusTel} onChange={handleChange} required />
        </label>
        <br />
        <button type="submit">สมัครสมาชิก</button>
      </form>
      <div>
        <Search/>
      </div>
    </div>
  )
}

export default Member