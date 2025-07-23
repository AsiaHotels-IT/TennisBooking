import {BrowserRouter,Route,Routes} from 'react-router-dom';
import Booking from './page/Booking';
import Reservation from './page/Reservation';
import Member from './page/Member';
import SaleReport from './page/SaleReport';
import Display from './page/Display';
import './App.css';
import ReprintReceipt from './page/ReprintReceipt';
import Register from './page/auth/Register';
import Login from './page/auth/Login';

function App() {
  return (
     <BrowserRouter>
     <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
     </Routes>
      <Routes>
        <Route path="/" element={<Booking />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/member" element={<Member />} />
        <Route path="/saleReport" element={<SaleReport />} />
        <Route path="/display" element={<Display />} />
        <Route path="/reprintReceipt" element={<ReprintReceipt />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
