import { Badge,Card, Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaseOneLayout } from './PhaseOne';
import { PhaseTwoLayout } from './PhaseTwo';
import { PhaseThreeLayout } from './PhaseThree';

export const HomePage = (props) => {
    const navigate = useNavigate();
    const [waiting, setWaiting] = useState(true);


    useEffect(() => {
        try {
            props.getPhase();
            setWaiting(false);
        }
        catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
            setWaiting(false);
        }
    }, []);

    const handleManagePhase = () => {
        try {
            navigate('/admin');  
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
            setWaiting(false);
        }
    };

    if (!waiting){
        return (
            <>
                {waiting && <Alert variant='secondary'>Please, wait for the server's answer...</Alert>}
                <Container fluid>
                    <h1>Welcome to the Budget App</h1>
                    {props.loggedIn && (
                        <>
                        <Row className="mt-4">
                            <Col >
                            <h3>Hello, {props.currentUserId}</h3>
                            {props.phase > 0 &&
                            <h3>The budget set is <Badge bg="secondary">€ {props.budget}</Badge></h3> }
                            </Col>
                        
                            
                            {props.loggedInAsAdmin && (
                                
                                    <Col lg={6} className="mx-auto" >
                                        <Card className="card-admin">
                                            <Card.Header>Admin Section</Card.Header>
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <Card.Title>Manage Budget</Card.Title>
                                                        <Card.Text>
                                                            As an admin, you can define the budget and manage phases of process.
                                                        </Card.Text>
                                                    </div>
                                                    <Button onClick={handleManagePhase} variant="primary">
                                                        Manage Phase
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                
                        )}
                        </Row>
                        <hr />
                        {props.phase === 1 && (
                            <PhaseOneLayout currentUserId={props.currentUserId} budget={props.budget} phase={props.phase} setMessage={props.setMessage} getPhase={props.getPhase} />
                        )}
                        {props.phase === 2 && (
                            <PhaseTwoLayout currentUserId={props.currentUserId} getUserPreferences={props.getUserPreferences} userPreferences={props.userPreferences}  updatePreference={props.updatePreference} setMessage={props.setMessage} getPhase={props.getPhase} phase={props.phase} />
                        )}
                    
                    </>
                )}

                {(((!props.loggedInAsAdmin && (props.phase === 0)) || (props.phase < 3 && !props.loggedIn)) &&
                        <Col md={6} className="text-secondary" as='h3'>Proposals definition phase still closed.</Col>
                    )}
                    {props.phase === 3 && (
                        <PhaseThreeLayout loggedIn={props.loggedIn} setMessage={props.setMessage} getPhase={props.getPhase} phase={props.phase} />
                    )}
                
            </Container>
           
            </>
        );
    }
    else{
        return <p>Loading...</p>;
    }
}
