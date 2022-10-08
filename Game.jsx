import { useContractReader } from "eth-hooks";
import { ethers, utils } from "ethers";
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Account } from "../components";
import { Button, Input, Select, Radio } from "antd";
import { storeKeyNameFromField } from "@apollo/client/utilities";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Game({ 
    yourLocalBalance, 
    readContracts,
    writeContracts,
    tx
}) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract

  const gameNumber = useContractReader(readContracts, "YourContract", "gameNumber");
  const [inputValue, setInputValue] = useState("");
  const buyinReq = useRef(0);
  const name = useRef("");
  const [gameName, setName] = useState("");
  const [gameId, setGameId] = useState("");
  const gameInput = useRef();

  // Getter for game mapping


  function print() {
    console.log(utils.parseEther(gameId));
  }

  const num = 1;
  const gameId2 = 1;

  return (
    <div><br /> 
      <h1>Join a game</h1>
      <div>
        <input
          placeholder="Name for game"
          type="text"
          value={gameName}
          name={name}
          onChange={(e) => setName(e.target.value)}>
        </input>
        <br /><br />
        <input
          placeholder="Game id:"
          type="text"
          value={gameId}
          name={gameInput}
          onChange={(e) => setGameId(e.target.value)}>
        </input>
        <br /><br />
        <input
          placeholder="Amount to buyin with" 
          type="text"
          value={inputValue}
          name={buyinReq}
          onChange={(e) => setInputValue(e.target.value)}>
        </input>
        </div>
        <div>
        <Button
          style={{ marginTop: 8 }}
          onClick={async () => {     
          {/* Function I am having some trouble with: */}    
            const result = tx(writeContracts.YourContract.buyin("Josh", 1, utils.parseEther(`1000000000000000000`)
            ), update => {
                console.log("📡 Transaction Update:", update);
                  if (update && (update.status === "confirmed" || update.status === 1)) {
                    console.log(" 🍾 Transaction " + update.hash + " finished!");
                    console.log(" ⛽️ " + update.gasUsed + "/" + (update.gasLimit || update.gas) + " @ " + parseFloat(update.gasPrice) / 1000000000 + " gwei");
                  } else {
                    return;
                  }
                  });
                    console.log("awaiting metamask/web3 confirm result...", result);
                    console.log(await result);
                    }}>Join Game</Button>    
                  </div>
                <button onClick={print}>Print</button>  
    </div>
  );
}

export default Game;
