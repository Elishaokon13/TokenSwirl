// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface IPoolManager {
    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        address recipient,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external returns (uint256 amountOut);
}

contract BatchSwapToUSDC is Ownable {
    IPoolManager public immutable poolManager;
    address public immutable USDC;
    uint24 public constant FEE = 500; // 0.05%

    mapping(address => uint256) public nonces;
    mapping(address => bool) public allowedTokens;

    struct TokenSwap {
        address tokenIn;
        uint256 amountIn;
        uint256 minAmountOut;
    }

    event TokenWhitelisted(address token, bool allowed);
    event Swapped(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address _poolManager, address _usdc) Ownable(msg.sender) {
        require(_poolManager != address(0), "Invalid pool manager");
        require(_usdc != address(0), "Invalid USDC address");
        poolManager = IPoolManager(_poolManager);
        USDC = _usdc;
    }

    /// @notice Whitelist or un-whitelist a token
    function setAllowedToken(address token, bool allowed) external onlyOwner {
        allowedTokens[token] = allowed;
        emit TokenWhitelisted(token, allowed);
    }

    /// @notice Batch swap authorized by user signature (EIP-7702-style)
    function batchSwapToUSDC(
        TokenSwap[] calldata swaps,
        address user,
        uint256 nonce,
        bytes calldata signature
    ) external {
        require(swaps.length > 0, "No tokens provided");
        require(nonce == nonces[user], "Invalid nonce");

        bytes32 hash = keccak256(abi.encode(user, address(this), nonce));
        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(hash);
        address recovered = ECDSA.recover(digest, signature);
        require(recovered == user, "Invalid signature");

        nonces[user]++;

        for (uint256 i = 0; i < swaps.length; i++) {
            TokenSwap calldata swap = swaps[i];

            require(swap.tokenIn != address(0), "Invalid token");
            require(allowedTokens[swap.tokenIn], "Token not allowed");
            require(swap.amountIn > 0, "Zero amount");

            bool ok = IERC20(swap.tokenIn).transferFrom(user, address(this), swap.amountIn);
            require(ok, "Transfer failed");

            IERC20(swap.tokenIn).approve(address(poolManager), swap.amountIn);

            uint256 amountOut = poolManager.swapExactInputSingle(
                swap.tokenIn,
                USDC,
                FEE,
                user,
                swap.amountIn,
                swap.minAmountOut
            );

            emit Swapped(user, swap.tokenIn, swap.amountIn, amountOut);
        }
    }

    /// @notice Prevent ETH from being sent to this contract
    receive() external payable {
        revert("ETH not accepted");
    }

    fallback() external payable {
        revert("Fallback not supported");
    }
}
