import {BrowserRouter,Route,Routes} from 'react-router-dom';
import Booking from './page/Booking';
import Reservation from './page/Reservation';
import Member from './page/Member';
import './App.css';

function App() {
  return (
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Booking />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/member" element={<Member />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
