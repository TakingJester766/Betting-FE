import { Button, Input, Select, Radio } from "antd";
import { useContractReader } from "eth-hooks";
import { ethers, utils } from "ethers";
import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Address, Balance, Events } from "../components";
const {Option} = Select;

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/

function Home({ 
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts, }) {
  
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract

  // gameNumber import ---------------------------------------------------------------------------------------------

  const gameNumber = useContractReader(readContracts, "YourContract", "gameNumber");

  // ---------------------------------------------------------------------------------------------------------------
  
  const purpose = useContractReader(readContracts, "YourContract", "purpose");
  const [newPurpose, setNewPurpose] = useState("loading...");
  const [newGameNumber, setGameNumber] = useState("loading...");
  const [amountToSend, setAmount] = useState('.1');
  
    
  return (
    <div>  
      {/* setPurpose and render purpose --------------------------------------------------------------------*/}
      <h1>The Purpose: {purpose}</h1>
      <div style={{ margin: 8 }}>
          <Input style={{ width:"300px" }}
            onChange={e => {
              setNewPurpose(e.target.value);
            }}
          /><br/>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = tx(writeContracts.YourContract.setPurpose(newPurpose), update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Set Purpose!
          </Button>
        </div>
        <h1>Send Ether:</h1>
        <div style={{ margin: 8 }}>
        <h1>You selected {amountToSend} Ether</h1>
        </div>
        <Select
        value={amountToSend}
        defaultValue={"default"}
        onChange={setAmount}
      >
        <Option value={"default"} disabled>
          Choose an option
        </Option>
          <Option value={"0"}>Select an Amount</Option>
          <Option value={".1"}>.1 Ether</Option>
          <Option value={".2"}>.2 Ether</Option>
          <Option value={".5"}>.5 Ether</Option>
      </Select><br /><br />
      <Button
        onClick={() => {
          if (amountToSend == null || amountToSend == '0') {
            alert('Make sure you set how much Ether you wanted to send!')
            return
            } else {
              /*
              you can also just craft a transaction and send it to the tx() transactor
              here we are sending value straight to the contract's address:
            */
            tx({
              to: writeContracts.YourContract.address,
              value: utils.parseEther(`${amountToSend}`),
            });
          {/* this should throw an error about "no fallback nor receive function" until you add it */}
      }}}>Send Value</Button>
      
      <Radio.Group 
      name="buyinRequirement" 
      defaultValue={'.1'} 
      >
        <Radio value={'.1'}>.1 Ether</Radio>
        <Radio value={'.5'}>.5 Ether</Radio>
        <Radio value={'1'}>1 Ether</Radio>
      </Radio.Group>
    </div>
  );
}

export default Home;

/*











*/