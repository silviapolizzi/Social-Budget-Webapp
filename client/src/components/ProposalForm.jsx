import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import API from '../API.mjs';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export function ProposalForm(props) {
    const [proposal, setProposal] = useState({description: '',cost: 0});
    const [errors, setErrors] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const navigate = useNavigate();

    
    useEffect(() => {
        try {
            if (props.mode === 'edit' && props.editableProposal) {
                setProposal(props.editableProposal);
            }
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
        }
    }, [props.mode, props.editableProposal]);

    // validate form input
    const validateForm = () => {
        const validationErrors = {};
        if (proposal.cost > props.budget) {
            validationErrors.cost = 'Cost cannot exceed the budget of €' + props.budget;
        }
        if (proposal.description.trim() === '') {
            validationErrors.description = 'Description cannot be empty';
        }
        return validationErrors;
    };
    
    // handle the form submission
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            setWaiting(true);
            const validationErrors = validateForm();
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                setWaiting(false);
                return;
            }
            setErrors([]);
            
            if (props.mode === 'add') {
                await API.addProposal({ description: proposal.description, cost: proposal.cost });
                setWaiting(false);
                props.handleShowAddForm();
            } else {
                await API.updateProposal(proposal.id, { description: proposal.description, cost: proposal.cost });
                navigate('/'); // Navigate back to the main page 
            }
        }
        catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
        }
    };

    

    return (
        <>
        {waiting && <p className="lead">Loading...</p>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea"
                        rows={1}
                        maxLength={100}
                        required
                        value={proposal.description}
                        onChange={(event) => setProposal({ ...proposal, description: event.target.value })}
                    />
                    {errors.description && (
                        <div className="text-danger">{errors.description}</div>
                    )}
                </Form.Group>
                <Form.Group className='mb-3'>
                    <Form.Label>Cost</Form.Label>
                    <Form.Control
                        type="number"
                        required
                        value={proposal.cost}
                        onChange={(event) => setProposal({ ...proposal, cost: Number(event.target.value) })}
                    />
                    {errors.cost && (
                        <div className="text-danger">{errors.cost}</div>
                    )}
                </Form.Group>
                <Button type="submit" variant="success">
                    {props.mode === 'add' ? 'Add' : 'Update'}
                </Button>
            </Form>
        </>
    );
}


export function EditProposalLayout(props) {

    // get the proposal to edit from the url
    const location = useLocation();
    const editableProposal = location.state;

    useEffect(() => {
        try {
            props.getPhase();
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
        }
    }, []);

    return (
        <Container fluid className='mt-3'>
            <Row>
                <Col>
                    <h1>Edit Proposal</h1>
                </Col>
            </Row>
            {props.mode === 'edit' && !editableProposal ?
                <Row>
                    <Col lg={10} className="mx-auto">
                        <p>Proposal not found</p>
                        <Link to='/'>Go back</Link>
                    </Col>
                </Row>
                :
                <Row>
                    <Col lg={10} className="mx-auto">
                        <ProposalForm mode={props.mode}  editableProposal={editableProposal} budget={props.budget} setMessage={props.setMessage} getPhase={props.getPhase} />
                    </Col>
                </Row>
            }
        </Container>
    )
}


