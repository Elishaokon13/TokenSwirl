// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {BatchSwapHook} from "../src/BatchSwapHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

contract DeployBatchSwapHook is Script {
    function run() public returns (BatchSwapHook) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory baseRpcUrl = vm.envString("BASE_RPC_URL");

        // Uniswap V4 PoolManager address on Base Mainnet
        IPoolManager poolManager = IPoolManager(0x498581ff718922c3f8e6a244956af099b2652b2b);

        vm.startBroadcast(deployerPrivateKey);

        BatchSwapHook hook = new BatchSwapHook(poolManager);

        vm.stopBroadcast();

        return hook;
    }
} 

