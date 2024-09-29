import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import {check, validationResult} from 'express-validator';
import {getBudget, setBudget, getPhase, updatePhase, addProposal, getUserProposals, updateProposal, deleteProposal, addPreference, deletePreference, getUserPreferences, getUserPreference, updatePreference, getApprovedProposals, resetDatabase, getAllProposals, setPhase} from './dao.mjs';
import {getUser} from './user-dao.mjs';

// Passport-related imports 
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

// init
const app = express();
const port = 3001;

// middleware
app.use(express.json());
app.use(morgan('dev'));
// set up and enable CORS
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));


// Passport: set up local strategy 
passport.use(new LocalStrategy(async function verify(username, password, cb) {
    const user = await getUser(username, password);
    if(!user)
        return cb(null, false, 'Incorrect username and/or password.');
    
    return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
    return cb(null, user);
    // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
});

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({error: 'Not authorized'});
}

const isLoggedInAsAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
    secret: "Super-super-secret-phrase",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


const checkPhase = (allowedPhases) => async (req, res, next) => {
    try {
        const currentPhase = await getPhase();
        if (allowedPhases.includes(currentPhase)) {
            next();
        } else {
            res.status(403).json({ error: 'Action not allowed in current phase' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error checking phase' });
    }
};

/* ROUTES */

// BUDGET
// GET /api/budget
app.get('/api/budget', isLoggedIn, async (req, res) => {
    try{
        const budget = await getBudget();
        res.json(budget ? budget : 0);
    } catch {
        res.status(500).end()
    }
});

// POST /api/budget
app.post('/api/budget', isLoggedInAsAdmin, checkPhase([0]), [
    check('budget').isNumeric().withMessage('Budget must be a number')
    .isFloat({min: 0.01}).withMessage('Budget must be greater than 0')
  ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(422).json({errors: errors.array()});
      }
      const { budget } = req.body;
      try {
          await setBudget(Number(budget));
          res.status(200).json({ message: 'Budget updated successfully' });
      }
      catch (err) {
          console.log(`ERROR: ${err.message}`);
          res.status(500).json({ error: 'Impossible to update budget' });
      }
  });

// PHASES
// GET /api/phases
app.get('/api/phases',  async (req, res) => {
    try{
        const phase = await getPhase();
        res.json(phase ? phase : 0);
    } catch {
        res.status(500).end()
    }
});
// POST /api/phases
app.post('/api/phases', isLoggedInAsAdmin, [
    check('phase').isNumeric().withMessage('Phase must be a number')
  ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(422).json({errors: errors.array()});
      }
      const { phase } = req.body;
      try {
          await setPhase(Number(phase));
          res.status(200).json({ message: 'Phase updated successfully' });
      }
      catch (err) {
          console.log(`ERROR: ${err.message}`);
          res.status(500).json({ error: 'Impossible to add phase' });
      }
  });

// PUT /api/phases
app.put('/api/phases', isLoggedInAsAdmin, [
    check('phase', 'Phase is required').isNumeric(),
],
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const {phase} = req.body;
    try {
        await updatePhase(Number(phase));
        res.status(200).json({message: 'Phase updated successfully'});
    }
    catch (err) {
        console.log(`ERROR: ${err.message}`);
        res.status(500).json({'error': `Impossible to update phase`});
    }
});


// GET /api/proposals
app.get('/api/proposals', isLoggedIn, checkPhase([1]), async (req, res) => {
    try{
        const userId = req.user.id;
        const proposals = await getUserProposals(userId);
        res.json(proposals);
    } catch {
        res.status(500).end()
    }
});



// POST /api/proposals
app.post('/api/proposals', isLoggedIn,  checkPhase([1]),[
    check('description', 'Description is required').notEmpty(),
    check('cost', 'Cost is required').isNumeric(),
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const {description, cost} = req.body;
    const userId = req.user.id;
    try {
        const proposal = await addProposal(userId, description, cost);
        res.status(201).json(proposal);
    }
    catch (err) {
        console.log(`ERROR: ${err.message}`);
        res.status(500).json({error: err.message});
    }
});

// PUT /api/proposals/:proposalId

app.put('/api/proposals/:proposalId', isLoggedIn,  checkPhase([1]), [
    check('description', 'Description is required').notEmpty(),
    check('cost', 'Cost is required').isNumeric(),
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const proposalId = req.params.proposalId;
    const { description, cost} = req.body;
    const userId = req.user.id;
    try {
        const changes = await updateProposal(proposalId, userId, description, cost);
        if (changes === 0) {
            res.status(404).json({'error': `Proposal ${proposalId} not found`});
        }
        else {
            res.status(200).end();
        }
    }
    catch (err) {
        console.log(`ERROR: ${err.message}`);
        res.status(500).json({'error': `Impossible to update proposal ${proposalId}`});
    }
});

// DELETE /api/proposals/:proposalId
app.delete('/api/proposals/:proposalId', isLoggedIn,  checkPhase([1]), async (req, res) => {
    const {proposalId} = req.params;
    const userId = req.user.id;

    try {   

        const changes = await deleteProposal(proposalId, userId);
        if (changes === 0) {
            res.status(404).json({'error': `Proposal ${proposalId} not found`});
        }
        else {
            res.status(200).end();
        }
    }
    catch (err) {
        console.log(`ERROR: ${err.message}`);
        res.status(500).json({'error': `Impossible to delete proposal ${proposalId}`});
    }
});

// GET /api/porposals/all
app.get('/api/proposals/all', isLoggedIn, checkPhase([2]), async (req, res) => {
    try{
        const userId = req.user.id;
        const proposals = await getAllProposals(userId);
        res.json(proposals);
    } catch {
        res.status(500).end()
    }
});

// GET /api/preferences
app.get('/api/preferences', isLoggedIn,  checkPhase([2]),async (req, res) => {
    try{
        const userId = req.user.id;
        const preferences = await getUserPreferences(userId);
        res.json(preferences);
    } catch(err) {
        console.log(`ERROR: ${err.message}`);
        res.status(500).end()
    }
});

// GET /api/preferences/:proposalId
app.get('/api/preferences/:proposalId', isLoggedIn,  checkPhase([2]),async (req, res) => {
    try{
        const userId = req.user.id;
        const preference = await getUserPreference(userId, req.params.proposalId);
        res.json(preference);
    } catch(err) {
        console.log(`ERROR: ${err.message}`);
        res.status(500).end()
    }
});

// POST /api/preferences
app.post('/api/preferences', isLoggedIn,  checkPhase([2]),[
    check('proposalId', 'ProposalId is required').notEmpty(),
    check('score', 'Score is required').isNumeric(),
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const {proposalId, score} = req.body;
    const userId = req.user.id;
    try {
        const preference = await addPreference(userId, proposalId, Number(score));
        res.status(201).json(preference);
    }
    catch (err) {
        console.log(`ERROR: ${err.message}`);
        res.status(500).json({'error': `Impossible to add preference for proposal ${proposalId}`});
    }
});

// PUT /api/preferences/:proposalId
app.put('/api/preferences/:proposalId', isLoggedIn,  checkPhase([2]),[
    check('score', 'Score is required').isNumeric(),
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const proposalId = req.params.proposalId;
    const { score} = req.body;
    const userId = req.user.id;
    try {
        const changes = await updatePreference(userId, proposalId, Number(score));
        if (changes === 0) {
            res.status(404).json({'error': `Preference ${proposalId} not found`});
        }
        else {
            res.status(200).end();
        }
    }
    catch (err) {
        console.log(`ERROR: ${err.message}`);
        res.status(500).json({'error': `Impossible to update preference ${preferenceId}`});
    }
});


// DELETE /api/preferences/:proposalId
app.delete('/api/preferences/:proposalId', isLoggedIn,  checkPhase([2]),async (req, res) => {
    
    const {proposalId} = req.params;
    const userId = req.user.id;
    console.log(proposalId);
    try {
        const changes = await deletePreference(userId, proposalId);
        if (changes === 0) {
            res.status(404).json({'error': `Preference ${proposalId} not found`});
        }
        else {
            res.status(200).end();
        }
    }
    catch (err) {
        console.log(`ERROR: ${err.message}`);
        res.status(500).json({'error': `Impossible to delete preference ${preferenceId}`});
    }
});


// GET /api/proposals/approved
app.get('/api/proposals/approved',  checkPhase([3]), async (req, res) => {
    try{
        const {approvedProposals} = await getApprovedProposals();
        res.json(approvedProposals);
    } catch {
        res.status(500).end()
    }
});

// GET /api/proposals/notapproved
app.get('/api/proposals/notapproved', isLoggedIn, checkPhase([3]), async (req, res) => {
    try{
        const {notApprovedProposals} = await getApprovedProposals();
        res.json(notApprovedProposals);
    } catch {
        res.status(500).end()
    }
});


// RESET DATABASE
app.delete('/api/reset', isLoggedInAsAdmin,  checkPhase([3]),async (req, res) => {
    const userId = req.user.id;
    try {
        const reset = await resetDatabase();
        res.status(200).end();
    }
    catch (err) {
        console.log(`ERROR: ${err.message}`);
        res.status(500).json({'error': `Impossible to reset database`});
    }
});

// SESSIONS
// POST /api/sessions 
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
        if (!user) {
          // display wrong login messages
          return res.status(401).send(info);
        }
        // success, perform the login
        req.login(user, (err) => {
          if (err)
            return next(err);
          
          // req.user contains the authenticated user, we send all the user info back
          return res.status(201).json(req.user);
        });
    })(req, res, next);
  });

// GET /api/sessions/current 
app.get('/api/sessions/current', (req, res) => {
// console.log('Session:', req.session);
// console.log('User:', req.user);
if(req.isAuthenticated()) {
    res.json(req.user);}
else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current 
app.delete('/api/sessions/current', (req, res) => {
req.logout(() => {
    res.end();
});
});

// far partire il server
app.listen(port, () => { console.log(`API server started at http://localhost:${port}`); });