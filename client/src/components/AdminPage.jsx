import { ListGroup, Card, Container, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import API from '../API.mjs';

export const AdminPage = (props) => {
    const [newBudget, setNewBudget] = useState('');
    const [waiting, setWaiting] = useState(true);

    useEffect(() => {

        const getPhaseBudget = async () => {
            setWaiting(true);
            try{
                // if the phase is not 0, get the budget from the server and update the budget state (same for phase)
                if (props.phase && props.loggedIn){
                    await props.getPhase();
                    await props.getBudget();
                }
                setWaiting(false);
            }catch (err){
                setWaiting(false);
                console.log(err);
                props.setMessage({msg: err.message , type: 'danger'});
            }
        }
        
        getPhaseBudget();
            
    }, [props.phase]);


    // handle the budget change and pass to the next phase
    const handleSetBudget = async (e) => {
        try {
            e.preventDefault();
            if (props.phase === undefined  || props.phase === 0){
                await API.setPhase(0);
                props.getPhase();
            }
            await API.setBudget(parseFloat(newBudget));
            props.updatePhase(1);
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err , type: 'danger'});
        }

    };

    // handle the phase change
    const handleClosePhase = async () => {
        try {
            if (props.phase === 3){
                await API.resetDatabase();
                props.getPhase();
                props.getBudget();
            }
            else{
              props.updatePhase(props.phase + 1);
            }
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message, type: 'danger'});
        }
    };


    const managePhaseInfo = () => {
        const phases = ['Budget Setting', 'Proposal Submission', 'Voting', 'Results'];
        return (
            <Container >
            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Header>Budget Definition Phases</Card.Header>
                        <ListGroup variant="flush">
                            {phases.map((phaseName, index) => (
                                <ListGroup.Item
                                    key={index}
                                    // highlight the current phase in blue
                                    style={{
                                        backgroundColor: index === props.phase ? 'lightblue' : index < props.phase ? 'lightgrey' : 'white'
                                    }}
                                >
                                    <div>
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h5><strong>Phase {index}</strong></h5>
                                                <p>{phaseName}</p>
                                                {index === 0 && props.budget > 0 && (
                                                    <Badge pill variant="info"> Budget: {props.budget}€</Badge>
                                                )}
                                            </div>
                                            {index === props.phase && props.phase > 0 && (
                                                <Button variant="primary" onClick={handleClosePhase} className="ml-2">
                                                    {props.phase === 3 ? 'Restart' : 'Close Phase'}
                                                </Button>
                                            )}
                                        </div>
                                        {index === 0 && props.phase === 0 && (
                                            <Form onSubmit={handleSetBudget} className="mt-3">
                                                <Form.Group>
                                                    <Form.Label>Enter Budget:</Form.Label>
                                                    <Form.Control type="number" value={newBudget} min = "0.01" onChange={(e) => setNewBudget(e.target.value)} required />
                                                </Form.Group>
                                                <Button type="submit">Set Budget</Button>
                                            </Form>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
            </Container>
        );
    };

    if (!waiting){
        return (
            <Container fluid>
                <h1>Welcome to the Budget App</h1>
                {props.loggedIn && (
                    <>
                        <h2>Hello, {props.currentUserId}</h2>
                        {props.loggedInAsAdmin && managePhaseInfo()}
                    </>
                )}
            </Container>
        );
    }
    else{
        return <p>Loading...</p>;
    }
    
};
