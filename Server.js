const express  = require('express')
const bodyParser = require('body-parser');

Web3 = require('web3')
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8081"));
contract = require('truffle-contract')
voting_artifacts = require('./build/contracts/Voting.json')
var Voting = contract(voting_artifacts);

if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8081. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8081"));
  }
  Voting.setProvider(web3.currentProvider);
  console.log('web3 Voting is Providing')


const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(function(req,res,next){
    res.setHeader('Content-Type','text/json')
    res.header('Access-Control-Allow-Origin', "*");     // TODO - Make this more secure!!
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/', (req,res) => {
        // account = web3.eth.accounts[0]
            res.setHeader('Content-Type','text/json'),
            res.status(200).end("Hola");   
});

app.post('/voteForCandidate', (req,res) => {
    Voting.deployed().then(function(contractInstance) {
        // account = web3.eth.accounts[0]
        contractInstance.voteForCandidate(req.body.idEvento, req.body.candidateName, req.body.voteTokens,
            req.body.address,
            {gas: 140000, from: web3.eth.accounts[0]}).then(function() {
           contractInstance.totalVotesFor.call(req.body.candidateName).then(function(v) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(v,null,2));
          });
        });
    });
});

app.post('/createVoter', (req,res) => {
    Voting.deployed().then(function(contractInstance) {
        console.log(req.body);
            contractInstance.createVoter(req.body.email, req.body.address, req.body.voteTokens,
                {
                    from: web3.eth.accounts[0]
                }).then(function (v) {      
                res.setHeader('Content-Type','text/json'),
                res.status(200).end(JSON.stringify(v,null,2)).catch((error) => {
                    assert.isNotOk(error,'Promise error')
            });
         });
    });
});


app.post('/voterInfo', (req,res) => {
    Voting.deployed().then(function(contractInstance) {        
        contractInstance.voterInfo.call(req.body.address).then(function(v) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(v,null,2));
        });
    });
})

app.post('/voterDetails', (req,res) => {
    Voting.deployed().then(function(contractInstance) {        
        contractInstance.voterDetails.call(req.body.address).then(function(v) {
            console.log(v)
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(v,null,2));
        });
    });
})

app.post('/allCandidates', (req,res) => {
    Voting.deployed().then(function(contractInstance) {
        contractInstance.allCandidates.call(req.body.idEvento).then(function(candidateArray) {            
            var candidates = [];  
            for (var index = 0; index < candidateArray.length; index++) {
                candidates[index] = web3.toUtf8(candidateArray[index]);                
            }
            res.status(200).end(JSON.stringify(candidates,null,2));
        });
    });
});

app.post('/addCandidate', (req,res) => {
    Voting.deployed().then(function(contractInstance) {
        console.log(req.body);
        contractInstance.addCandidate(req.body.idEvento, req.body.name,
        {
            gas: 140000,
            from: web3.eth.accounts[0]
        }).then(function (v) {
        res.setHeader('Content-Type','text/json'),
        res.status(200).end(JSON.stringify(v,null,2)).catch((error) => {
            assert.isNotOk(error,'Promise error');
            });
        });
    });            
});

app.post('/addEvento', (req,res) => {
    Voting.deployed().then(function(contractInstance) {
        console.log(req.body);
        contractInstance.addCandidate(req.body.idEvento, req.body.name, req.body.maxVotos,
        req.body.candidatos,
        {
            gas: 140000,
            from: web3.eth.accounts[0]
        }).then(function (v) {
        res.setHeader('Content-Type','text/json'),
        res.status(200).end(JSON.stringify(v,null,2)).catch((error) => {
            assert.isNotOk(error,'Promise error');
            });
        });
    });            
});

app.post('/newAccount', (req,res) => {    
    Voting.deployed().then(function(contractInstance) {
        console.log('--------Contrato vivo---------'+ req.body.passwor)
        web3.personal.newAccount(req.body.password, function(error, address) {
            web3.personal.unlockAccount(address, req.body.password, function(error, result) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(address,null,2));
            });
        });
    });
});

app.post('/totalVotesFor', (req,res) => {    
    Voting.deployed().then(function(contractInstance) {
        contractInstance.totalVotesFor.call(req.body.idEvento, req.body.name).then(function(v) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(v,null,2));
        });
    });
})

app.post('/totalTokens', (req,res) => {    
    Voting.deployed().then(function(contractInstance) {
        contractInstance.totalTokens().then(function(v) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(v,null,2));
        });
    });
})

app.post('/tokensSold', (req,res) => {    
    Voting.deployed().then(function(contractInstance) {
        contractInstance.tokensSold.call().then(function(v) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(v,null,2));
        });
    });
});

app.post('/tokenPrice', (req,res) => {    
    Voting.deployed().then(function(contractInstance) {
        contractInstance.tokenPrice().then(function(v) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(web3.fromWei(v),null,2));
        });
    });
})

app.post('/getBalance', (req,res) => {    
    Voting.deployed().then(function(contractInstance) {
        web3.eth.getBalance(contractInstance.address, function(error, result) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(web3.fromWei(result),null,2));
        });
    });
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
console.log('Escuchando puerto' + PORT);
});


