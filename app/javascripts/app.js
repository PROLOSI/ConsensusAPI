// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
/*import { default as contract } from 'truffle-contract'


 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 

import voting_artifacts from '../../build/contracts/Voting.json'

var Voting = contract(voting_artifacts);
*/
let candidates = {}
import $ from "jquery";

let tokenPrice = 1;

window.voteForCandidate = function(candidate) {
  let candidateName = $("#candidate").val();
  let voteTokens = $("#vote-tokens").val();
  $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
  $("#candidate").val("");
  $("#vote-tokens").val("");

  /* Voting.deployed() returns an instance of the contract. Every call
   * in Truffle returns a promise which is why we have used then()
   * everywhere we have a transaction call
   */

    $.post("http://localhost:3000/voteForCandidate",{candidateName : candidateName ,voteTokens: voteTokens},
    function(data){
      if(data === "done"){
        alert("Error");
      }
      else{
        let div_id =  candidates[candidateName];
        $("#" + div_id).html(data.toString());
        $("#msg").html("");
      }
    });
}

/* The user enters the total no. of tokens to buy. We calculate the total cost and send it in
 * the request. We have to send the value in Wei. So, we use the toWei helper method to convert
 * from Ether to Wei.
 */

window.buyTokens = function() {
  let tokensToBuy = $("#buy").val();
  let price = tokensToBuy * tokenPrice;
  $("#buy-msg").html("Purchase order has been submitted. Please wait.");


  $.post("http://localhost:3000/buy",{price: price},function(data){
    if(data === "done"){
      alert("Error");
    }
    else{
      $("#buy-msg").html("");
        $.post("http://localhost:3000/getBalance",null,function(data){
          if(data === "done"){
            alert("Error");
          }
          else{
            $("#contract-balance").html(data.toString() + " Ether");
          }
        });
    }
  });
  populateTokenData();
}

window.lookupVoterInfo = function() {
  let address = $("#voter-info").val();

  $.post("http://localhost:3000/voterDetails",{address: address},function(v){
    if(v === "done"){
      alert("Error");
    }
    else{
      $("#tokens-bought").html("Total Tokens bought: " + v[0].toString());
      let votesPerCandidate = v[1];
      $("#votes-cast").empty();
      $("#votes-cast").append("Votes cast per candidate: <br>");
      let allCandidates = Object.keys(candidates);
      for(let i=0; i < allCandidates.length; i++) {
        $("#votes-cast").append(allCandidates[i] + ": " + votesPerCandidate[i] + "<br>");
      }
    }
  });
}

/* Instead of hardcoding the candidates hash, we now fetch the candidate list from
 * the blockchain and populate the array. Once we fetch the candidates, we setup the
 * table in the UI with all the candidates and the votes they have received.
 */
function populateCandidates() {
  $.post("http://localhost:3000/allCandidates",null,function(candidateArray){
    if(candidateArray === "done"){
      alert("Error");
    }
    else{
      for(let i=0; i < candidateArray.length; i++) {
        /* We store the candidate names as bytes32 on the blockchain. We use the
         * handy toUtf8 method to convert from bytes32 to string
         */
        candidates[web3.toUtf8(candidateArray[i])] = "candidate-" + i;
      }
      setupCandidateRows();
      populateCandidateVotes();
      populateTokenData();
    }
  });
}

function populateCandidateVotes() {
  let candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];

    $.post("http://localhost:3000/totalVotesFor",{name:name},function(v){
      if(v === "done"){
        alert("Error");
      }
      else{
        $("#" + candidates[name]).html(v.toString());
      }
    });
  }
}

function setupCandidateRows() {
  Object.keys(candidates).forEach(function (candidate) { 
    $("#candidate-rows").append("<tr><td>" + candidate + "</td><td id='" + candidates[candidate] + "'></td></tr>");
  });
}

/* Fetch the total tokens, tokens available for sale and the price of
 * each token and display in the UI
 */
function populateTokenData() {

  $.post("http://localhost:3000/totalTokens",null,function(v){
    if(v === "done"){
      alert("Error");
    }
    else{
      $("#tokens-total").html(v.toString());
      console.log(v);
    }
  });

  $.post("http://localhost:3000/tokensSold",null,function(v){
    if(v === "done"){
      alert("Error");
    }
    else{
      $("#tokens-sold").html(v.toString());
    }
  }); 

 $.post("http://localhost:3000/tokenPrice",null,function(v){
    if(v === "done"){
      alert("Error");
    }
    else{
      $("#token-cost").html(parseFloat(web3.fromWei(v.toString())) + " Ether");
    }
  }); 

  $.post("http://localhost:3000/getBalance",null,function(result){
    if(result === "done"){
      alert("Error");
    }
    else{
      $("#contract-balance").html(web3.fromWei(result.toString()) + " Ether");
    }
  }); 
}

$( document ).ready(function() {
  populateCandidates();
});
