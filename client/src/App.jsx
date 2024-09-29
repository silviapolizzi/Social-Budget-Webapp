import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Container, Row, Alert } from 'react-bootstrap';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import NavHeader from './components/NavHeader';
import { HomePage } from './components/HomePage';
import { AdminPage } from './components/AdminPage';
import { LoginForm } from './components/AuthComponent';
import { PhaseOneLayout } from './components/PhaseOne';
import { PhaseThreeLayout } from './components/PhaseThree';
import NotFound from './components/NotFoundComponent';
import { EditProposalLayout } from './components/ProposalForm';
import { UserPreferences, ProposalsToVote } from './components/PhaseTwo';
import API from './API.mjs';
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInAsAdmin, setLoggedInAsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const [budget, setBudget] = useState(0);
  const [phase, setPhase] = useState(0);
  const [userPreferences, setUserPreferences] = useState([]);
  const [waiting, setWaiting] = useState(true);


  const getBudget = async () => {
      try {
          const budget = await API.getBudget();
          setBudget(budget);
      }catch (err){
          setMessage({msg: err.message , type: 'danger'});
      }
  };

  const getPhase = async () => {
      try {
          const phaseValue = await API.getPhase();
          setPhase(phaseValue);
      }catch (err){
          setMessage({msg: err.message , type: 'danger'});
      }
  };  

  const updatePhase = async (newPhase) => {
    try {
      await API.updatePhase(newPhase);
      setPhase(newPhase);
    }
    catch (err) {
      console.log(err);
      setMessage({msg: err.message , type: 'danger'});
    }
  };

  const getUserPreferences = async () => {
    try {
        const preferences = await API.getUserPreferences(user.id);
        setUserPreferences(preferences);
    }catch (err){
      setMessage({msg: err.message , type: 'danger'});
    }
};

const updatePreference = async (proposalId, vote) => {
  try {
    if (vote === 0) {
        await API.deletePreference(proposalId);
        setUserPreferences(prev => prev.filter(p => p.proposalId !== proposalId));
    } else {
        const preference = await API.getPreference(proposalId);
        if (preference) {
            await API.updatePreference(proposalId, vote);
            // if the preference exists, update it
            setUserPreferences(prev => {
              const updatedPreferences = prev.filter(p => p.proposalId !== proposalId);
              return [...updatedPreferences, { ...prev, proposalId, score: vote }];
            });
        }
        else {
            await API.addPreference(proposalId, vote);
            // if the preference does not exist, add it
            setUserPreferences(prev => [...prev, { ...prev, proposalId, score: vote }]);
        }
    }
    await getUserPreferences();
  }catch (err) {
    console.log(err);
    setMessage({msg: err.message , type: 'danger'});
  }
}

useEffect(() => {
  const checkAuth = async () => {
    try {
      setWaiting(true);
      const user = await API.getUserInfo();
      if (user){
        setLoggedIn(true);
        setUser(user);
        setLoggedInAsAdmin(user.role === 'admin');
      }
      else{
        console.log("User not logged in");
      }
    } catch (err) {

      console.log(err);
    }
    finally{
      setWaiting(false);
    }
  };
  checkAuth();
}, []);


useEffect(() => {
  try {
    getPhase();
    if (loggedIn) {
      setWaiting(true);
      getBudget();
      setWaiting(false);
    }
  }catch (err) {
    console.log(err);
    setMessage({msg: err.message , type: 'danger'});
  }
}, [loggedIn]);

useEffect(() => {
  const fetchPhaseData = async () => {
    try {
      setWaiting(true);
      if (phase === 2 && loggedIn) {
        getUserPreferences();
      }
      setWaiting(false);
    }catch (err) {
      console.log(err);
      setMessage({msg: err.message , type: 'danger'});
      setWaiting(false);
    }
  };
  try {
    fetchPhaseData();
  }catch (err) {
    console.log(err);
    setMessage({msg: err.message , type: 'danger'});
  }
}, [phase, loggedIn]);

useEffect(() => {
  if (!waiting){
  }
}, [waiting]);


  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({msg: `Welcome, ${user.id}!`, type: 'success'});
      setUser(user);
      setLoggedInAsAdmin(user.role === 'admin');
    } catch (err) {
      console.log(err);
      setMessage({msg: err , type: 'danger'});
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setUser(null);
    setLoggedIn(false);
    setLoggedInAsAdmin(false);
    setMessage('');
  };

  if (waiting ){
    return <h2>Loading...</h2>
  }
  else{
    return (
      <>
      <Routes>
        <Route element={
          <>
            <NavHeader loggedIn={loggedIn} handleLogout={handleLogout} phase={phase}  />
            <Container fluid className='mt-3'>
              {message && <Row>
                <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
              </Row>}
              <Outlet />
            </Container>
          </>
        }>
          <Route index element={<HomePage loggedIn={loggedIn} currentUserId={user?.id} loggedInAsAdmin={loggedInAsAdmin} phase = {phase} getPhase={getPhase} budget={budget} getBudget={getBudget} setBudget={setBudget} getUserPreferences= {getUserPreferences} userPreferences={userPreferences}  updatePreference={updatePreference} setMessage={setMessage}/>}
          />
          
          <Route path="/admin" element={!loggedInAsAdmin ?  <Navigate replace to='/' /> : <AdminPage loggedIn={loggedIn} currentUserId={user?.id} loggedInAsAdmin={loggedInAsAdmin} updatePhase={updatePhase} phase = {phase} getPhase={getPhase}  budget={budget} getBudget={getBudget} setMessage={setMessage}/> }/>

          <Route path="/myproposals" element={ phase == 1 && loggedIn ? <PhaseOneLayout currentUserId={user?.id} phase = {phase} getPhase={getPhase} budget={budget} setMessage={setMessage} /> : <Navigate replace to='/' />}
          />
          <Route path="/editProposal/:proposalId" element={phase == 1 && loggedIn ? <EditProposalLayout mode="edit" budget = {budget} setMessage={setMessage} phase = {phase} getPhase={getPhase}/> : <Navigate replace to='/' />}
          />
          <Route path="/mypreferences" element={phase == 2 && loggedIn ? <UserPreferences currentUserId={user?.id} getUserPreferences={getUserPreferences} userPreferences={userPreferences}  updatePreference = {updatePreference} setMessage={setMessage} phase = {phase} getPhase={getPhase}/> : <Navigate replace to='/' />}
          />
          <Route path="/proposals" element={phase == 2 && loggedIn ? <ProposalsToVote currentUserId={user?.id} phase = {phase} getPhase={getPhase} userPreferences={userPreferences}   updatePreference={updatePreference} setMessage={setMessage}/> : <Navigate replace to='/' />}
          />
          <Route path="/results" element={phase === 3 ? <PhaseThreeLayout loggedIn={loggedIn} setMessage={setMessage} phase = {phase} getPhase={getPhase}/> : <Navigate replace to='/' />}
          />
          <Route path="*" element={<NotFound />} 
          />
          <Route path="/login" element={loggedIn ? <Navigate replace to='/' /> : <LoginForm login={handleLogin} setMessage={setMessage}/>}
          />
        </Route>
      </Routes>
    </>
    )
  }
}

export default App;
