/* Data Access Object (DAO) module for the budget_sociale application */

import { db } from './db.mjs';

/* BUDGET */
// set budget
export const setBudget = (budget) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO budget (amount) VALUES (?)';
        db.run(sql, [budget], function(err) {
        if (err) return reject(err);
        resolve(budget);
        });
        
    });
    };

//get budget
export const getBudget = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT amount FROM budget';
      db.get(sql, [], (err, row) => {
        if (err) return reject(err);
        if (!row) { // if there is no budget, return undefined
          resolve(undefined);
        } else {
          resolve(row.amount);
        }
      });
    });
  };

/* PHASES */
// set phase
export const setPhase = (phase) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO phases (phase) VALUES (?)';
        db.run(sql, [phase], function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
        });    
    });
    };


// update phase
export const updatePhase = (phase) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE phases SET phase = ?';
        db.run(sql, [phase], function(err) {
        if (err) return reject(err);
        resolve(this.changes);
        });
    });
    };

// get phase
export const getPhase = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT phase FROM phases';
        db.get(sql, [], (err, row) => {
        if (err) return reject(err);
        if (!row) {
            resolve(undefined); // if there is no phase, return undefined
        } else {
            resolve(row.phase);
        }
        });
    });
    };


/* PROPOSALS */
// add proposal
export const addProposal = (userId, description, cost) => {
    return new Promise((resolve, reject) => {
        // Check if the user has already done 3 proposals
        const countSql = 'SELECT COUNT(*) AS count FROM proposals WHERE user_id = ?';
        db.get(countSql, [userId], (err, row) => {
            if (err) return reject(err);
            if (row.count >= 3) { // if the user has done already 3 proposals, return an error
                return reject(new Error('Maximum number of proposals reached'));
            }

            const sql = 'INSERT INTO proposals (user_id, description, cost) VALUES (?, ?, ?)';
            db.run(sql, [userId, description, cost], function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    });
    };

// get proposals of a user
export const getUserProposals = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM proposals WHERE user_id = ?';
        db.all(sql, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// delete proposal
export const deleteProposal = (proposalId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM proposals WHERE id = ? AND user_id = ?';
        db.run(sql, [proposalId, userId], function(err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
};

// update proposal
export const updateProposal = (proposalId, userId, description, cost) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE proposals SET description = ?, cost = ? WHERE id = ? AND user_id = ?';
        db.run(sql, [description, cost, proposalId, userId], function(err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
};

//get all proposals
export const getAllProposals = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM proposals';
        db.all(sql, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

/* PREFERENCES */
// add a preference
export const addPreference = (userId, proposalId, score) => {
  return new Promise((resolve, reject) => {
      // Check if the user is the author of the proposal
      const authorCheckSql = 'SELECT user_id FROM proposals WHERE id = ?';
      db.get(authorCheckSql, [proposalId], (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Proposal not found')); // if the proposal is not found, return an error
          if (row.user_id === userId) {
              return reject(new Error('Cannot add preference to own proposal')); // if the user is the author of the proposal, return an error
          }
          // Insert the preference
          const sql = `
              INSERT INTO preferences (user_id, proposal_id, score)
              VALUES (?, ?, ?)
          `;

          db.run(sql, [userId, proposalId, score], function(err) {
              if (err) return reject(err);
              resolve(this.changes);
          });
      });
  });
};

// update a preference
export const updatePreference = (userId, proposalId, score) => {
  return new Promise((resolve, reject) => {
      const sql = 'UPDATE preferences SET score = ? WHERE user_id = ? AND proposal_id = ?';
      db.run(sql, [score, userId, proposalId], function(err) {
          if (err) return reject(err);
          resolve(this.changes);
      });
  });
};

// get specific preference
export const getUserPreference = (userId, proposalId) => {
  return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM preferences WHERE user_id = ? AND proposal_id = ?';
      db.get(sql, [userId, proposalId], (err, row) => {
          if (err) return reject(err);
          if (!row)
              resolve(null);
          resolve(row);
      });
  });
};

// delete a preference
export const deletePreference = (userId, proposalId) => {
  return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM preferences WHERE user_id = ? AND proposal_id = ?';
      db.run(sql, [userId, proposalId], function(err) {
          if (err) return reject(err);
          resolve(this.changes);
      });
  });
};

// get preferences of a user
export const getUserPreferences = (userId) => {
  return new Promise((resolve, reject) => {
      const sql = `
          SELECT 
              p.id AS proposal_id,
              p.description,
              p.cost,
              p.user_id as author,
              pref.score
          FROM 
              proposals p
          JOIN 
              preferences pref ON p.id = pref.proposal_id
          WHERE 
              pref.user_id = ?
      `;
      db.all(sql, [userId], (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
      });
  });
};


/* PHASE 3 */
// get proposals with total scores sorted by total score (desc)
export const getProposalsWithScores = () => {
    return new Promise((resolve, reject) => {
        // calculate total score for each proposal and sort by total score (desc)
        const sql = `
            SELECT p.id, p.description, p.cost, p.user_id AS author, SUM(pr.score) AS total_score
            FROM proposals p
            LEFT JOIN preferences pr ON p.id = pr.proposal_id
            GROUP BY p.id
            ORDER BY total_score DESC
          `;
          db.all(sql, [], (err, rows) => {
            if (err) return reject(err);
            // Map the results to set the score to 0 if it is null
            const proposalsWithScores = rows.map(row => ({
                ...row,
                total_score: row.total_score || 0
            }));
            resolve(proposalsWithScores);
        });
    });
};  

// get approved proposals and rejected ones
export const getApprovedProposals = () => {
  return new Promise((resolve, reject) => {
      getBudget().then((budget) => {
          getProposalsWithScores().then((proposals) => {
              // totalCost is the total cost of all approved proposals
              let totalCost = 0; 
              const approvedProposals = [];
              const notApprovedProposals = [];

              for (const proposal of proposals) {
                  if (totalCost + proposal.cost <= budget) {
                      approvedProposals.push(proposal);
                      totalCost += proposal.cost; // update total cost with the cost of the approved proposal
                  } else {
                      notApprovedProposals.push(proposal);
                      break; // stop the loop when a proposal cannot be accepted
                  }
              }

              // Add all remaining proposals to notApprovedProposals
              for (let i = approvedProposals.length + notApprovedProposals.length; i < proposals.length; i++) {
                  notApprovedProposals.push(proposals[i]);
              }

              resolve({ approvedProposals, notApprovedProposals });
          }).catch(error => reject(error));
      }).catch(error => reject(error));
  });
};

/* RESET DATABASE */
// reset database
export const resetDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => { // query done in serial 
            db.run("DELETE FROM preferences", function(err) {
                if (err) {
                    return reject(err);
                }

                db.run("DELETE FROM proposals", function(err) {
                    if (err) {
                        return reject(err);
                    }

                    db.run("DELETE FROM budget", function(err) {
                        if (err) {
                            return reject(err);
                        }

                        db.run("DELETE FROM phases", function(err) {
                            if (err) {
                                return reject(err);
                            }
                            // VACUUM used to reset autoincrement ids
                            db.run("VACUUM", function(err) {
                                if (err) {
                                    return reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
};


