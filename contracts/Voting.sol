pragma solidity ^0.4.10; //We have to specify what version of the compiler this code will use

contract Voting {

  // We use the struct datatype to store the voter information.
  struct voter {
    bytes32 email;
    address voterAddress; // The address of the voter
    uint tokensBought;    // The total no. of tokens this voter owns
    uint[] tokensUsedPerCandidate; // Array to keep track of votes per candidate.
    /* We have an array of candidates initialized below.
     Every time this voter votes with her tokens, the value at that
     index is incremented. Example, if candidateList array declared
     below has ["Rama", "Nick", "Jose"] and this
     voter votes 10 tokens to Nick, the tokensUsedPerCandidate[1]
     will be incremented by 10.
     */
  }

  struct Evento {
    uint IdEvento;
    uint maxAllowedVotes;
    uint totalVotes;
    bytes32 name;
    bytes32[] candidateList;
    mapping (bytes32 => uint)  votesReceived;
  }

  /* mapping is equivalent to an associate array or hash
   The key of the mapping is candidate name stored as type bytes32 and value is
   an unsigned integer which used to store the vote count
   */

  mapping (address => voter) public voterInfo;

  /* Solidity doesn't let you return an array of strings yet. We will use an array of bytes32
   instead to store the list of candidates
   */

  mapping (uint => Evento) public Eventos;
  mapping (uint => uint) public maxVotes;
  

  uint public totalTokens; // Total no. of tokens available for this election
  uint public balanceTokens; // Total no. of tokens still available for purchase
  uint public tokenPrice; // Price per token

  /* When the contract is deployed on the blockchain, we will initialize
   the total number of tokens for sale, cost per token and all the candidates
   */
  function Voting() {

      }

 function addEvento(uint idEvento, bytes32 name, uint maxVotes) {
     Eventos[idEvento].IdEvento = idEvento;
     Eventos[idEvento].name = name;
     Eventos[idEvento].maxAllowedVotes = maxVotes;
  }

  function addCandidate(uint idEvento, bytes32 name) {  
     uint index = indexOfCandidate(idEvento, name);
     bytes32[] candidateList = Eventos[idEvento].candidateList; 
     require(index == uint(-1));    
     candidateList.push(name);
     Eventos[idEvento].candidateList = candidateList;
  }

  function totalVotesFor(uint idEvento, bytes32 candidate) constant returns (uint) {
     return Eventos[idEvento].votesReceived[candidate];
  }

  /* Instead of just taking the candidate name as an argument, we now also
   require the no. of tokens this voter wants to vote for the candidate
   */
  function voteForCandidate(uint idEvento, bytes32 candidate, uint votesInTokens, address _address) {
    uint index = indexOfCandidate(idEvento, candidate);
    uint max = indexOfmaxVotes(idEvento);
    if (index == uint(-1)) throw;
    if (max == uint(-1)) throw;

    // msg.sender gives us the address of the account/voter who is trying
    // to call this function
     bytes32[] candidateList = Eventos[idEvento].candidateList; 
    if (voterInfo[_address].tokensUsedPerCandidate.length == 0) {
      for(uint i = 0; i < candidateList.length; i++) {
        voterInfo[_address].tokensUsedPerCandidate.push(0);
      }
    }
    if(voterInfo[_address].tokensUsedPerCandidate[index] >= 1) throw;

    // Make sure this voter has enough tokens to cast the vote
    uint availableTokens = voterInfo[_address].tokensBought - totalTokensUsed(voterInfo[_address].tokensUsedPerCandidate);
    if (availableTokens < votesInTokens) throw;

    Eventos[idEvento].votesReceived[candidate] += votesInTokens;
    Eventos[idEvento].totalVotes += votesInTokens;

    // Store how many tokens were used for this candidate
    voterInfo[_address].tokensUsedPerCandidate[index] += votesInTokens;
  }

  // Return the sum of all the tokens used by this voter.
  function totalTokensUsed(uint[] _tokensUsedPerCandidate) private constant returns (uint) {
    uint totalUsedTokens = 0;
    for(uint i = 0; i < _tokensUsedPerCandidate.length; i++) {
      totalUsedTokens += _tokensUsedPerCandidate[i];
    }
    return totalUsedTokens;
  }

  function indexOfCandidate(uint idEvento, bytes32 candidate) constant returns (uint) {
     bytes32[] candidateList = Eventos[idEvento].candidateList; 
    for(uint i = 0; i < candidateList.length; i++) {
      if (candidateList[i] == candidate) {
        return i;
      }
    }
    return uint(-1);
  }


 function indexOfmaxVotes(uint idEvento) constant returns (uint) {
     uint max = Eventos[idEvento].maxAllowedVotes; 
     uint total = Eventos[idEvento].totalVotes; 
     if(max == 0) {
       return 1;
     }
     if(total >= max) {
       return uint(-1);
     }
       return 1;
  }

  /* This function is used to purchase the tokens. Note the keyword 'payable'
   below. By just adding that one keyword to a function, your contract can
   now accept Ether from anyone who calls this function. Accepting money can
   not get any easier than this!
   */

  function createVoter(bytes32 _email, address _adress, uint votes) {
    voterInfo[_adress].email = _email;
    voterInfo[_adress].voterAddress = _adress;
    voterInfo[_adress].tokensBought += votes;
    balanceTokens += 1;
  }

  function tokensSold() constant returns (uint) {
    return totalTokens - balanceTokens;
  }

  function voterDetails(address user) constant returns (uint, uint[]) {
    return (voterInfo[user].tokensBought, voterInfo[user].tokensUsedPerCandidate);
  }

  /* All the ether sent by voters who purchased the tokens is in this
   contract's account. This method will be used to transfer out all those ethers
   in to another account. *** The way this function is written currently, anyone can call
   this method and transfer the balance in to their account. In reality, you should add
   check to make sure only the owner of this contract can cash out.
   */

  function transferTo(address account) {
    account.transfer(this.balance);
  }

  function allCandidates(uint idEvento) constant returns (bytes32[]) {
     return Eventos[idEvento].candidateList;
  }

}
