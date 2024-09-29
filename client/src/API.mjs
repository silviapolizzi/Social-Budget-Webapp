import {Proposal, Preference, ProposalWithScore} from './Models.mjs';

const SERVER_URL = 'http://localhost:3001';

// API to get the budget
const getBudget = async () => {
  const response = await fetch(SERVER_URL + '/api/budget', {
    credentials: 'include'
  });
  const budget = await response.json();
  if (response.ok)
    return budget;
  else {    
    const errDetails = await response.text();
    throw errDetails;
  }
};

// API to set the budget
const setBudget = async (budgetAmount ) => {
  const response = await fetch(SERVER_URL + '/api/budget', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',    
    },
    credentials: 'include',
    body: JSON.stringify({budget: budgetAmount }),
  });
  if(response.ok) {
    return await response.json();
  } 
  else {
    const errDetails = await response.text();  
    throw errDetails;
  }
};

// API to set the phase
const setPhase = async (phaseSelected) => {
  const response = await fetch(SERVER_URL + '/api/phases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',    
    },
    credentials: 'include',
    body: JSON.stringify({phase: phaseSelected}),
  });
  if(response.ok) {
    return await response.json();
  } 
  else {
    const errDetails = await response.text();  
    throw errDetails;
  }
};

// API to update the phase
const updatePhase = async (phaseUpdated) => {
  const response = await fetch(SERVER_URL + '/api/phases', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',    
    },
    credentials: 'include',
    body: JSON.stringify({phase: phaseUpdated}),
  });
  if(response.ok) {
    return await response.json(); 
  } 
  else {
    const errDetails = await response.text();  
    throw errDetails;
  }
};

// API to get the phase
const getPhase = async () => {
  const response = await fetch(SERVER_URL + '/api/phases', {
  });
  const phase = await response.json();
  if (response.ok)
    return phase;
  else {  
    const errDetails = await response.text();
    throw errDetails;
  }
};

// API to add a proposal
const addProposal = async (proposal) => {
    const response = await fetch(SERVER_URL + '/api/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({description: proposal.description, cost: proposal.cost}),
    });
    if(response.ok) {
      return await response.json();
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };

// API to update a proposal
const updateProposal = async (proposalId, proposal) => {
    const response = await fetch(SERVER_URL + `/api/proposals/${proposalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({description: proposal.description, cost: proposal.cost}),
    });
    if(!response.ok) {
      const errMessage = await response.json();
      throw errMessage;
    }
    else return null;
  };

// API to delete a proposal
const deleteProposal = async (proposalId) => {
    const response = await fetch(SERVER_URL + `/api/proposals/${proposalId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if(response.ok) {
      return null;
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };  

// API to get the proposals of the current user
const getUserProposals = async () => {
    const response = await fetch(SERVER_URL + '/api/proposals', {
        credentials: 'include',
      });
    if (response.ok){
        const proposalsJson = await response.json();
        const proposals = proposalsJson.map(proposal => new Proposal(proposal.id, proposal.description, proposal.cost, proposal.user_id));
        return proposals;
    }
    else {
        throw new Error(await response.text());
    }
  };

// API to get all proposals
const getProposals = async () => {
    const response = await fetch(SERVER_URL + '/api/proposals/all', {
        credentials: 'include'
      });
    if (response.ok){
        const proposalsJson = await response.json();
        const proposals = proposalsJson.map(proposal => new Proposal(proposal.id, proposal.description, proposal.cost, proposal.user_id));
        return proposals;
    }
    else {
        throw new Error(await response.text());
    }
  };

// API to add a preference
const addPreference = async (proposalId, score) => {
    const response = await fetch(SERVER_URL + '/api/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({proposalId: proposalId, score: score}),
    });
    if(response.ok) {
      return await response.json();
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };

// API to get a specific preference
const getPreference = async (proposalId) => {
    const response = await fetch(SERVER_URL + `/api/preferences/${proposalId}`, {
        credentials: 'include',
      });
    if (response.ok){
        const preferenceJson = await response.json();
        if (preferenceJson === null)
            return null;
        return new Preference(
          preferenceJson.proposal_id, 
          preferenceJson.description, 
          preferenceJson.cost, 
          preferenceJson.author, 
          preferenceJson.score
      );
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
  };

// API to update a preference
const updatePreference = async (proposalId, scoreUpdated) => {
    const response = await fetch(SERVER_URL + `/api/preferences/${proposalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({score: scoreUpdated}),
    });
    if(response.ok) {
      return null;
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };

// API to delete a preference
const deletePreference = async (proposalId) => {
    const response = await fetch(SERVER_URL + `/api/preferences/${proposalId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if(response.ok) {
      return null;
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };

// API to get the preferences of the current user
const getUserPreferences = async () => {
    const response = await fetch(SERVER_URL + '/api/preferences', {
        credentials: 'include',
      });
    if (response.ok){
        const preferencesJson = await response.json();
        const preferences = preferencesJson.map(preference => new Preference(preference.proposal_id, preference.description, preference.cost, preference.author, preference.score));
        return preferences;
    } else {
        throw new Error(await response.text());
    }
  };

// API to get the approved proposals
const getApprovedProposals = async () => {
    const response = await fetch(SERVER_URL + '/api/proposals/approved', {
      });
    if (response.ok){
        const proposalsJson = await response.json();
        const proposals = proposalsJson.map(proposal => new ProposalWithScore(proposal.id, proposal.description, proposal.cost, proposal.author, proposal.total_score));
        return proposals;
    }
    else {
        throw new Error(await response.text());
    }
  };

  // API to get the not approved proposals
const getNotApprovedProposals = async () => {
  const response = await fetch(SERVER_URL + '/api/proposals/notapproved', {

      credentials: 'include',
    });
  if (response.ok){
      const proposalsJson = await response.json();
      const proposals = proposalsJson.map(proposal => new ProposalWithScore(proposal.id, proposal.description, proposal.cost, proposal.author, proposal.total_score));
      return proposals;
  }
  else {
      throw new Error(await response.text());
  }
};


// API to reset the database
const resetDatabase = async () => {
    const response = await fetch(SERVER_URL + '/api/reset', {
      method: 'DELETE',
      credentials: 'include'
    }); 
    if (response.ok)
        return null;
    else {
        throw response.text();
    } 
  };

// USERS
// login

// login
const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

// current user
const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  if (response.status === 401){
    return null;
  }
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};

// logout
const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
  else {
      const errDetails = await response.text();
      throw errDetails;
  }
}


const API = {
    logIn,
    logOut,
    getUserInfo,
    getBudget,
    setBudget,
    setPhase,
    updatePhase,
    getPhase,
    getUserProposals,
    getProposals,
    addProposal,
    updateProposal,
    deleteProposal,
    getUserPreferences,
    getPreference,
    updatePreference,
    addPreference,
    deletePreference,
    getApprovedProposals,
    resetDatabase,
    getNotApprovedProposals,
  };
export default API;
