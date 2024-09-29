import { Row, Col, Container } from 'react-bootstrap';
import { ProposalsTable } from './ProposalsComponents.jsx';
import { useEffect, useState } from 'react';
import API from '../API.mjs';


export function PhaseThreeLayout(props) {
    useEffect(() => {
        try {
            props.getPhase();
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
        }
    }, []);
    
    return (

        <Container fluid>
        <Row>
            <Col md={6} as='h1'>
            Phase 3:
            </Col>
        </Row>
        <Row>
            <Col md={6} className="text-secondary" as='h3'>
            Results
            </Col>
        </Row>
        
        <Row>
            <Col lg={10} className="mx-auto">
                <ApprovedAndRejectedProposals loggedIn={props.loggedIn} setMessage={props.setMessage} phase={props.phase} getPhase={props.getPhase} />
            </Col>
        </Row>
      </Container>
    );
  }



  function ApprovedAndRejectedProposals(props) {
    const [approved, setApproved] = useState([]);
    const [rejected, setRejected] = useState([]);
    const [waiting, setWaiting] = useState(true);

    useEffect(() => {
        const getApprovedRejectedProposals = async () => {
            try {
                setWaiting(true);
                const approvedProposals = await API.getApprovedProposals();
                if (props.loggedIn) {
                    const rejectedProposals = await API.getNotApprovedProposals();
                    setRejected(rejectedProposals);
                }
                setApproved(approvedProposals);
                setWaiting(false);
            }catch (err) {
                console.log(err);
                props.setMessage({msg: err.message , type: 'danger'});
            }
        }
        try {
            props.getPhase()
            getApprovedRejectedProposals();
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
        }
    }, [props.loggedIn]);

    if (waiting){
        return <h2>Loading...</h2>
    }
    else {
        return (
        <>
            <Row>
                <Col as='h3'>Accepted Proposals</Col>
            </Row>
            <Row>
                <Col lg={10} className="mx-auto">
                    <ProposalsTable 
                        proposals={approved}
                        isApproved={true} 
                        setMessage={props.setMessage}
                        getPhase={props.getPhase}
                        phase = {props.phase}
                    />
                </Col>
            </Row>
            {props.loggedIn && (
            <>
            <Row className="mt-4">
                <Col as='h3'>Rejected Proposals</Col>
            </Row>
            <Row>
                <Col lg={10} className="mx-auto">
                    <ProposalsTable 
                        proposals={rejected}
                        isApproved={false} 
                        setMessage={props.setMessage}
                        getPhase={props.getPhase}
                        phase = {props.phase}
                    />
                </Col>
            </Row>
            </>
            )}
        </>
        );
    }
}
  
