import { Table, Button, Form} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export function ProposalsTable(props) {
    useEffect(() => {
        try {
            props.getPhase();
        }catch (err) {
            console.log(err);
            props.setMessage({msg: err.message , type: 'danger'});
        }
    }, []);
    
    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Description</th>
            <th>Cost (€)</th>
            {props.phase === 1 && <th>Actions</th>}
            {props.phase === 2 && <th>Vote</th>}
            {props.phase === 3 && props.isApproved && <th>Author</th>}
            {props.phase === 3 && <th>Total Score</th>}
          </tr>
        </thead>
        <tbody>
            
          {props.proposals.map((prop) => (
            <ProposalRow
              key={prop.id}
              proposal={prop}
              phase={props.phase}
              currentUserId={props.currentUserId}
              deleteProposal={props.deleteProposal}
              userPreferences={props.userPreferences ? props.userPreferences : []}
              updatePreference={props.updatePreference}
              isApproved={props.isApproved}
              color={props.phase === 3? (props.isApproved? 'success' : 'danger') : null}
            />
          ))}
        </tbody>
      </Table>
    );
  }

export function ProposalRow(props) {
  
    return (
      <tr className={props.color ? `table-${props.color}` : ''}>
        <ProposalData proposal={props.proposal} />
        {props.phase === 1 && <ProposalActions proposal={props.proposal} deleteProposal={props.deleteProposal}  />}
        {props.phase  === 2 && <VotingAction userPreferences={props.userPreferences} updatePreference={props.updatePreference} proposal={props.proposal} currentUserId={props.currentUserId}  />}
        {props.phase  === 3 && <AdditionalData proposal={props.proposal} isApproved={props.isApproved} />}
      </tr>
    );
  }
  
  function ProposalData(props) {
    return (
      <>
        <td>{props.proposal.description}</td>
        <td>{props.proposal.cost}</td>
      </>
    );
  }
  
  function ProposalActions(props) {
    return (
      <td>
        <Link className='btn btn-warning mx-1 ' to={`/editProposal/${props.proposal.id}`} state={props.proposal.serialize()}>
        <i className='bi bi-pencil-square' />
        </Link>
        <Button variant="danger" onClick={() => props.deleteProposal(props.proposal.id)}>
          <i className='bi bi-trash'></i>
        </Button>
      </td>
    );
  }
  
  // add a voting action to the proposal row
  function VotingAction(props) {
    const currentPreference = props.userPreferences.find(p => p.proposalId === props.proposal.id);
  
    return (
      <td>
        {props.proposal.userId !== props.currentUserId && (
          <Form.Control as="select" value={currentPreference ? currentPreference.score : 0} onChange={(e) => props.updatePreference(props.proposal.id, parseInt(e.target.value, 10))}>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </Form.Control>
        )}
      </td>
    );
  }

  // add additional data to the proposal row like the author if table is "approved proposals", and the total score
  function AdditionalData(props) {
    return (
      <>
       {props.isApproved && <td>{props.proposal.author}</td>}
       <td>{props.proposal.total_score}</td>
      </>
    );
  }
