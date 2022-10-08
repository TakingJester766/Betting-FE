pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "@openzeppelin/contracts/access/Ownable.sol"; 
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract is Ownable {
    
    // Declaration of gameNumber: -----------------------------------------------------------------------------------

    uint public gameNumber = 1;
    uint public initFee = 1000000000000000;
    uint public feesPending = 0;


    event SetPurpose(address sender, string purpose);

    event IncGameNumber(uint gameNumber);

    string public purpose = "Building Unstoppable Apps!!!";

    function sendViaCall(address payable _to) public payable {
        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool sent, bytes memory data) = _to.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }

    function setPurpose(string memory newPurpose) public {
        purpose = newPurpose;
        console.log(msg.sender,"set purpose to",purpose);
        emit SetPurpose(msg.sender, purpose);
    }

    function incGameNumber() internal {
        gameNumber++;
        emit IncGameNumber(gameNumber);
    }


    // Structs 
    struct Game {
        address host; // Establishes host function access
        uint gameId; // Allows different games to be played concurrently
        uint buyinRequirement; // To establish minimum buyin amount for a game
        uint etherWithdrawalReqs; // Tracks # of ether in total from requests. If >/< than contract balance, throws error        
        uint gamePot; // Tracks how much ether is in the game's pot
        uint8 tableWithdrawalReqs; // Tracks how many players have requested a withdrawal
        uint8 playerCount; // Tracks # of of players in a game
        uint8 verifiedWithdrawalReqs; // Tracks # of verifs that withdrawal requests are valid
        bool endedBuyin; // Host function to end buyin stage
    }
    
    struct Player {
        string name; // Allows players to more easily identify eachother
        uint gameId; // gameId generated from gameNumber
        uint buyinAmount; // How much a player has bought in with
        uint withdrawalAmount; // How much a player has requested a withdrawal for
        bool withdrawalReq; // Tracks if a player has submitted a request
        bool verifyReqs; // TO verify that all withdrawal requests look good at table
        bool hasWithdrawn; // To signify that a player has paidout to prevent triggering of any functions after they receieve back their funds
    }

    // Mapping for players
    mapping(address => Player) public playerInfo; // To call Player struct based on the msg.sender

    // Mapping for locating each game's details
    mapping(uint => Game) public idToGame; // To call Game struct to see game details

    // Array of Player structs
    Player[] private players; 

    // Array for Game structs. Allows games to be played continuously by resetting value in accordance with the current array struct
    Game[] private games;

    // ------------------------------------ Functions to enable new games --------------------------------------

    function initializeGame(uint buyinReq, uint initFee) public {
        require(initFee == 1000000000000000, "In order to prevent spam games that never resolve, each game initialization will cost  ether.");
        addFeesPending(initFee);
        idToGame[gameNumber] = Game(msg.sender, gameNumber, buyinReq, 0, 0, 0, 0, 0, false);
        games.push(idToGame[gameNumber]);
        incGameNumber();
    }    

    function addFeesPending(uint initFee) internal {
        feesPending += initFee;
    }

    // ------------------------------------------ Buyin Functions ----------------------------------------------

     function buyin(string memory name, uint id, uint buyinAmount) public payable {
        buyinAmount = msg.value;
        require (idToGame[id].endedBuyin != true, "The game you are attempting to join is either in process or has already been completed.");
        require (playerInfo[msg.sender].gameId == 0, "You must complete current game before buying into another.");
        require (idToGame[id].host != 0x0000000000000000000000000000000000000000, "You are attempting to join a game that has not been initialized.");
        require (buyinAmount >= idToGame[id].buyinRequirement, "Check the minumum buyin requirement, it appears it is higher than your deposit!");
        payable(this).transfer(buyinAmount);
        playerInfo[msg.sender] = Player(name, id, msg.value, 0, false, false, false);
        players.push(playerInfo[msg.sender]);
        idToGame[id].playerCount++;
        idToGame[playerInfo[msg.sender].gameId].gamePot += msg.value;
    }

    // For host to prevent further buyins

    function terminateBuyin () public {
        require (idToGame[playerInfo[msg.sender].gameId].playerCount > 0, "You cannot end the buy-in period with 0 players!");
        require (idToGame[playerInfo[msg.sender].gameId].host == msg.sender, "You do not have access to call this function because you are not the game's host.");
        require (idToGame[playerInfo[msg.sender].gameId].endedBuyin == false, "You have already ended the buyin period.");      
        idToGame[playerInfo[msg.sender].gameId].endedBuyin = true;
    }

    // ------------------------------------------ Withdrawal Functions ----------------------------------------------

     function addReq(uint amount) public {
        require (idToGame[playerInfo[msg.sender].gameId].endedBuyin == true, "Wait for your host to end the buyin stage before placing a withdrawal request.");
        require(playerInfo[msg.sender].hasWithdrawn == false, "You have already paid out!");
        require(playerInfo[msg.sender].buyinAmount > 0, "You have to buy in before you can withdraw!");
        require(playerInfo[msg.sender].withdrawalReq == false, "You have already submitted a withdrawal request. Please abort current withdrawal request to make a new one.");
        playerInfo[msg.sender].withdrawalReq = true;
        playerInfo[msg.sender].withdrawalAmount = amount;
        idToGame[playerInfo[msg.sender].gameId].etherWithdrawalReqs += amount;
        idToGame[playerInfo[msg.sender].gameId].tableWithdrawalReqs++;
    }

    function abortReq() public {
        require(playerInfo[msg.sender].hasWithdrawn == false, "You have already paid out!");        
        require(playerInfo[msg.sender].withdrawalReq == true, "You must have a pending withdrawal request in order to abort and submit a new one.");
        playerInfo[msg.sender].withdrawalReq = false; // Changes player's withdrawal request status to false
        idToGame[playerInfo[msg.sender].gameId].tableWithdrawalReqs--; // Subtracts the player withdrawal request from the game struct
        idToGame[playerInfo[msg.sender].gameId].etherWithdrawalReqs -= playerInfo[msg.sender].withdrawalAmount;
        playerInfo[msg.sender].withdrawalAmount = 0;
    }

     function verifyRequests() public {
        require(playerInfo[msg.sender].hasWithdrawn == false, "You have already paid out!");
        require(idToGame[playerInfo[msg.sender].gameId].playerCount != 0, "You can't verify requests when your game is empty, dumbass!");
        require(playerInfo[msg.sender].withdrawalReq == true && idToGame[playerInfo[msg.sender].gameId].tableWithdrawalReqs == idToGame[playerInfo[msg.sender].gameId].playerCount, "Not everyone has submitted a withdrawal request.");
        require(idToGame[playerInfo[msg.sender].gameId].gamePot == idToGame[playerInfo[msg.sender].gameId].etherWithdrawalReqs, "Ensure that player counts are valid. Counter found that contract balance was different than submitted in withdrawal requests.");
        playerInfo[msg.sender].verifyReqs = true;
        idToGame[playerInfo[msg.sender].gameId].verifiedWithdrawalReqs++;
    }

    function payout() public {
        require(playerInfo[msg.sender].hasWithdrawn == false, "You have already paid out!");
        require(idToGame[playerInfo[msg.sender].gameId].tableWithdrawalReqs == idToGame[playerInfo[msg.sender].gameId].verifiedWithdrawalReqs && idToGame[playerInfo[msg.sender].gameId].tableWithdrawalReqs == idToGame[playerInfo[msg.sender].gameId].playerCount, "Make sure everyone at the table has verified that all withdrawal requests are valid.");
        payable(msg.sender).transfer(playerInfo[msg.sender].withdrawalAmount);
        playerInfo[msg.sender].buyinAmount = 0;
        playerInfo[msg.sender].withdrawalAmount = 0;
        playerInfo[msg.sender].withdrawalReq = false;
        playerInfo[msg.sender].verifyReqs = false;
        playerInfo[msg.sender].gameId = 0;
        playerInfo[msg.sender].hasWithdrawn = true;
    }  

    // ------------------------------------------ Contract Owner Functions ----------------------------------------------

    function changeInitFee(uint newInitFee) public onlyOwner {
        initFee = newInitFee;
    }

    function withdrawFees() public onlyOwner {
        require(feesPending > 0, "No fees to collect.");
        payable(msg.sender).transfer(feesPending);
        feesPending = 0;
    }
    
  
  // to support receiving ETH by default
  receive() external payable {}
  fallback() external payable {}
}


