function Proposal(id, description, cost, userId) {
  this.id = id;
  this.description = description;
  this.cost = cost;
  this.userId = userId;

  this.serialize = () => {
    return {
      id: this.id,
      description: this.description,
      cost: this.cost,
      userId: this.userId,
    }
  };
}

function ProposalWithScore(id, description, cost, author, total_score) {
  this.id = id;
  this.description = description;
  this.cost = cost;
  this.author = author;
  this.total_score = total_score;

  this.serialize = () => {
    return {
      id: this.id,
      description: this.description,
      cost: this.cost,
      author: this.author,
      total_score: this.total_score,
    }
  };
}


function Preference( proposalId, description, cost, author, score) {
  this.proposalId = proposalId;
  this.description = description;
  this.cost = cost;
  this.author = author;
  this.score = score;

  this.serialize = () => {
    return {
      proposalId: this.proposalId,
      description: this.description,
      cost: this.cost,
      author: this.author,
      score: this.score,
    }
    
  };
}

export {Proposal, Preference,ProposalWithScore}