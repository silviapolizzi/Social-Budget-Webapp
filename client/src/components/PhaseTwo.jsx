import { useState, useEffect } from 'react';
import { Table, Button,  Row, Col, Container } from 'react-bootstrap';
import API from '../API.mjs';
import { ProposalsTable } from './ProposalsComponents.jsx';


export function PhaseTwoLayout(props) {

    return (
        <Container fluid>
        <Row>
            <Col md={6} as='h1'>
            Phase 2:
            </Col>
        </Row>
        <Row>
            <Col md={6} className="text-secondary" as='h3'>
            Voting
            </Col>
        </Row>
        <ProposalsToVote currentUserId={props.currentUserId} phase={props.phase} userPreferences={props.userPreferences} setUserPreferences={props.setUserPreferences} updatePreference={props.updatePreference} setMessage={props.setMessage} getPhase={props.getPhase} />
        <Row>
            <Col lg={10} className="mx-auto">
                <UserPreferences userPreferences={props.userPreferences}  updatePreference={props.updatePreference} setMessage={props.setMessage} getPhase={props.getPhase} getUserPreferences={props.getUserPreferences} phase={props.phase} />
            </Col>
        </Row>
      </Container>
    );
  }

export function ProposalsToVote(props) {
    const [proposals, setProposals] = useState([]);
    const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const getProposals = async () => {
      try {
        setWaiting(true);
        const proposals = await API.getProposals();
        setProposals(proposals);
        setWaiting(false);
      }catch (err) {
        console.log(err);
        props.setMessage({msg: err.message , type: 'danger'});
        setWaiting(false);
      }
    };
    try {
      props.getPhase();
      getProposals();
    }catch (err) {
      console.log(err);
      props.setMessage({msg: err.message , type: 'danger'});
    }

  }, []);

  if (waiting){
    return <p className="lead">Loading...</p>;
  }
  else {
  return(
    <>
    <Row>
            <Col lg={10} className="mx-auto" as='h3'>
            Proposals
            </Col>
        </Row>
        <Row>
            <Col lg={10} className="mx-auto">
                <ProposalsTable currentUserId={props.currentUserId} proposals={proposals} phase={props.phase} userPreferences={props.userPreferences} updatePreference={props.updatePreference} setMessage={props.setMessage} getPhase={props.getPhase}/>
            </Col>
    </Row>
    </>
  )
}
}


export function UserPreferences(props) {
    useEffect(() => {
        try {
            props.getPhase();
            props.getUserPreferences();
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
        }
    }, []);

    return (
      <Row>
        <Col lg={10} className="mx-auto" >
        <h3>Your Preferences</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Description</th>
              <th>Cost (€)</th>
              <th>Vote</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {props.userPreferences.map((pref) => (
              <PreferenceRow
                key={pref.proposalId}
                preference={pref}
                updatePreference={props.updatePreference}
              />
            ))}
          </tbody>
        </Table>
       </Col>
      </Row>
    );
  }

function PreferenceRow(props) {
    return (
      <tr>
        <td>{props.preference.description}</td>
        <td>{props.preference.cost}</td>
        <td> {props.preference.score}</td>
        <td>
          <Button variant="danger" onClick={() => props.updatePreference(props.preference.proposalId, 0)}>
            <i className='bi bi-trash'></i></Button>
        </td>
      </tr>
    );
  }