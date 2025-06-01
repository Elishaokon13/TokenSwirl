// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IEIP7702Account {
    function execute(address target, bytes calldata data) external payable returns (bytes memory);
} 