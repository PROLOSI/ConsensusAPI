const express  = require('express')
const bodyParser = require('body-parser');

Web3 = require('web3')
contract = require('truffle-contract')
voting_artifacts = require('./build/contracts/Voting.json')
var Voting = contract(voting_artifacts);

if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  Voting.setProvider(web3.currentProvider);
  console.log('web3 Voting is Providing')


const app = express();
app.use(bodyParser.urlencoded({extended:false}));

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
        contractInstance.voteForCandidate(req.body.candidateName, req.body.voteTokens, {gas: 140000, from: web3.eth.accounts[0]}).then(function() {
           contractInstance.totalVotesFor.call(req.body.candidateName).then(function(v) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(v,null,2));
          });
        });
    });
});


app.post('/indexOfCandidate', (req,res) => {
    Voting.deployed().then(function(contractInstance) {
        // account = web3.eth.accounts[0]
           contractInstance.indexOfCandidate.call(req.body.candidateName).then(function(v) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(web3.fromWei(v),null,2));
        });
    });
});


app.post('/createVoter', (req,res) => {
    Voting.deployed().then(function(contractInstance) {
        console.log(req.body);
            web3.personal.newAccount(req.body.password, function(error, result) {
                console.log(result);
                contractInstance.createVoter(req.body.name, req.body.password, req.body.email, result,
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
});


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
        contractInstance.allCandidates.call().then(function(candidateArray) {
            res.status(200).end(JSON.stringify(candidateArray,null,2));
        });
    });
});


app.post('/addCandidate', (req,res) => {
    Voting.deployed().then(function(contractInstance) {
        contractInstance.addCandidate(req.body.name,
        {
            from: web3.eth.accounts[0]
        }).then(function (v) {      
        res.setHeader('Content-Type','text/json'),
        res.status(200).end(JSON.stringify(v,null,2)).catch((error) => {
            assert.isNotOk(error,'Promise error');
            });;
        });
    });            
});



app.post('/newAccount', (req,res) => {    
    Voting.deployed().then(function(contractInstance) {
        console.log('--------Contrato vivo---------'+ req.body.passwor)
        web3.personal.newAccount(req.body.password, function(error, result) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(result,null,2));
        });
    });
});


app.post('/totalVotesFor', (req,res) => {    
    Voting.deployed().then(function(contractInstance) {
        contractInstance.totalVotesFor.call(req.body.name).then(function(v) {
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
})


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

app.post('/addCandidate', (req,res) => {    
    Voting.deployed().then(function(contractInstance) {
        contractInstance.addCandidate.call(req.body.name, function(error, result) {
            res.setHeader('Content-Type','text/json'),
            res.status(200).end(JSON.stringify(result,null,2));
        });
    });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
console.log('Escuchando puerto' + PORT);
});


