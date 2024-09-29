import { useEffect, useState } from 'react';
import { Container, Row, Col,  Button,  OverlayTrigger, Tooltip } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import API from '../API.mjs';
import { ProposalForm } from './ProposalForm';
import { ProposalsTable } from './ProposalsComponents.jsx';


export function PhaseOneLayout(props) {
    const [proposals, setUserProposals] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
  
    const maxProposals = 3;
  
    useEffect(() => {
        const getUserProposals = async () => {
            try {
                const userProposals = await API.getUserProposals(props.currentUserId);
                setUserProposals(userProposals);
            }catch (err) {
                console.log(err);
                props.setMessage({msg: err.message , type: 'danger'});
            }
        };
        try {
            props.getPhase();
            getUserProposals();
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
        }
    }, [showAddForm]);
  
    // delete a proposal
    const handleDeleteProposal = async (proposalId) => {
        try {
            await API.deleteProposal(proposalId);
            setUserProposals(olderuserProposals => {
                return olderuserProposals.filter(proposal => proposal.id !== proposalId)
            });
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
        }
        
        
    };
  
    // show or hide the add proposal form
    const handleShowAddForm = () => {
        try {
            setShowAddForm(!showAddForm);
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
        }
    };
  
    // check if there are proposals remaining  (max proposals for user is 3)
    const remainingProposals = maxProposals - proposals.length;
    const canAddProposal = remainingProposals > 0;
    return (
        <Container fluid>
            <Row>
              <Col md={6} as='h1'>
              Phase 1:
              </Col>
          </Row>
            <Row className="mt-3">
                <Col >
                    <h3>Proposals</h3>
                </Col>
            </Row>
            <Row>
                <Col lg={10} className="mx-auto">
                    <ProposalsTable proposals={proposals} deleteProposal={handleDeleteProposal} phase={props.phase} currentUserId={props.currentUserId}  setMessage={props.setMessage} getPhase={props.getPhase} />
                      <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        {!canAddProposal ? (
                        <OverlayTrigger
                            overlay={<Tooltip id="tooltip-disabled">You have reached the maximum number of proposals</Tooltip>}
                            placement="top">
                            <span className="d-inline-block">
                            <Button className="btn btn-danger" style={{ pointerEvents: 'none' }} disabled> Add </Button>
                            </span>
                        </OverlayTrigger>
                        ) : (
                            <Button className={`btn ${showAddForm ? "btn-danger" : "btn-success"}`} onClick={handleShowAddForm}>
                            {showAddForm ? "Cancel" : "Add"}
                          </Button>
                        )}
                    </div>
                    <div>
                        {remainingProposals} proposals remaining
                    </div>
                    </div>
                    {showAddForm && (<ProposalForm handleShowAddForm={handleShowAddForm} budget={props.budget} mode={"add"} setMessage={props.setMessage} />)}
                </Col>
            </Row>
        </Container>      
    );
  
  }
  