import { useContractReader } from "eth-hooks";
import React, { useState, useRef, useCallback } from "react";

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
  
 
  
  const gameNumber = useContractReader(readContracts, "YourContract", "gameNumber"); 

  // *********************
  
  return (
    <div>  
      <h1>{gameNumber}</h1>
    </div>
  );
}

export default Home;




