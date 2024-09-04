import { Outlet, useLocation } from 'react-router-dom';
import Header from '../src/componens/Header';
import Footer from '../src/componens/Footer';

function App() {
  const location = useLocation();

  // Check if the current path is login or register
  const hideHeaderFooter = location.pathname === '/' || location.pathname === '/register';

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Outlet />
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default App;
