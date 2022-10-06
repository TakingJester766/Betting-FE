import { useContractReader } from "eth-hooks";
import { ethers, utils } from "ethers";
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Select, Radio } from "antd";
import { useEffect } from "react";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function HostGame({
    address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {

    const gameNumber = useContractReader(readContracts, "YourContract", "gameNumber");

    const [inputValue, setInputValue] = useState("");

    const buyinReq = useRef(0);



    return (
        <div>
            <h1>Host a game</h1>
            <h1>Current game number: {gameNumber?.toString()}</h1>
            <div>
                <input
                    placeholder="Minimum game buyin" 
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
                    
                      /* look how you call setPurpose on your contract: */
                      /* notice how you pass a call back for tx updates too */
                        if (inputValue == null || inputValue == 0) {
                            alert("Make sure to set your buyin before starting the game.");
                            return;
                        } else {

                        const result = tx(writeContracts.YourContract.initializeGame(utils.parseEther(`${inputValue.toString()}`)), update => {
                            console.log("📡 Transaction Update:", update);
                            if (update && (update.status === "confirmed" || update.status === 1)) {
                            console.log(" 🍾 Transaction " + update.hash + " finished!");
                            console.log(" ⛽️ " + update.gasUsed + "/" + (update.gasLimit || update.gas) + " @ " + parseFloat(update.gasPrice) / 1000000000 + " gwei");
                            }
                        });
                        console.log("awaiting metamask/web3 confirm result...", result);
                        console.log(await result);
                    }}}>Start New Game</Button>    
            </div>      
        </div>
    )
}

export default HostGame;

/*<button onClick={print}>Print</button>      
function print() {
    console.log(inputValue);
}
*/