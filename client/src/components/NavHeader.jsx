import { Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './AuthComponent';

function NavHeader(props) {

  return (
    <Navbar style={{backgroundColor: '#101438'}} data-bs-theme='dark'>
      <Container fluid>
        <div className="d-flex align-items-center">
          <Link to='/' className='navbar-brand me-3 ' style={{ fontWeight: 'bold' }}> <i className="bi bi-cash-coin"></i> Budget App</Link>
          <Link to='/' className='btn btn-link text-white fs-5' >Home</Link>

          {props.phase === 1 && props.loggedIn && <Link to='/myproposals' className='btn btn-link text-white fs-5'>My Proposals</Link>}
          {props.phase === 2 && props.loggedIn && <Link to='/proposals' className='btn btn-link text-white fs-5'>Proposals</Link>}
          {props.phase === 2 && props.loggedIn && <Link to='/mypreferences' className='btn btn-link text-white fs-5'>My Preferences</Link>}
          {props.phase === 3 && <Link to='/results' className='btn btn-link text-white fs-5'>Results</Link>}

        </div>
        {props.loggedIn ?
          <LogoutButton logout={props.handleLogout} /> :
          <Link to='/login' className='btn btn-outline-light'>Login</Link>
        }
      </Container>
    </Navbar>
  );
}

export default NavHeader;