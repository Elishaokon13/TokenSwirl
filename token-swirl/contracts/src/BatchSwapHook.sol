// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {BaseHook} from "@uniswap/v4-core/src/hooks/BaseHook.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {SafeCast} from "@uniswap/v4-core/src/libraries/SafeCast.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

error Unauthorized();
error SwapFailed(address tokenIn, uint256 amountIn);
error InvalidPool();
error InvalidInput(string reason);
error NonceUsed(uint256 nonce);
error BatchTooLarge(uint256 size, uint256 maxSize);

contract BatchSwapHook is BaseHook, ReentrancyGuard {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using SafeCast for int256;

    // Constants
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // Mainnet USDC
    uint256 public constant MAX_BATCH_SIZE = 10; // Limit batch size to prevent gas limit issues
    uint256 public constant MIN_AMOUNT_IN = 1; // Minimum input amount to prevent dust attacks

    // State
    mapping(address => mapping(uint256 => bool)) public usedNonces; // Track used nonces per user
    address public immutable owner; // Contract deployer for initial setup

    // Events
    event BatchSwapExecuted(address indexed user, uint256 nonce, uint256 tokenCount, uint256 usdcReceived);
    event SwapCompleted(address indexed tokenIn, uint256 amountIn, uint256 usdcOut);
    event NonceInvalidated(address indexed user, uint256 nonce);

    struct SwapInstruction {
        address tokenIn; // ERC-20 token to swap from
        uint256 amountIn; // Amount to swap
        PoolKey poolKey; // Uniswap V4 pool key for tokenIn-USDC pair
        bytes hookData; // Optional hook data for swap
        uint256 minUsdcOut; // Minimum USDC output for slippage protection
    }

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {
        owner = msg.sender;
    }

    // EIP-7702 execute function with enhanced security
    function execute(address target, bytes calldata data) external payable nonReentrant returns (bytes memory) {
        // Decode data: expect (nonce, SwapInstruction[])
        (uint256 nonce, SwapInstruction[] memory instructions) = abi.decode(data, (uint256, SwapInstruction[]));

        // Security checks
        if (msg.sender != address(this)) revert Unauthorized(); // Ensure called via EIP-7702 delegation
        if (usedNonces[target][nonce]) revert NonceUsed(nonce);
        if (instructions.length == 0) revert InvalidInput("Empty instructions");
        if (instructions.length > MAX_BATCH_SIZE) revert BatchTooLarge(instructions.length, MAX_BATCH_SIZE);

        // Mark nonce as used
        usedNonces[target][nonce] = true;

        uint256 totalUsdcReceived = 0;

        for (uint256 i = 0; i < instructions.length; i++) {
            SwapInstruction memory instruction = instructions[i];

            // Validate inputs
            if (instruction.tokenIn == address(0) || instruction.tokenIn == USDC) {
                revert InvalidInput("Invalid tokenIn");
            }
            if (instruction.amountIn < MIN_AMOUNT_IN) {
                revert InvalidInput("Amount too low");
            }
            if (!isValidPool(instruction.poolKey)) {
                revert InvalidPool();
            }

            // Approve PoolManager for exact amount
            IERC20 tokenIn = IERC20(instruction.tokenIn);
            if (!tokenIn.approve(address(poolManager), instruction.amountIn)) {
                revert InvalidInput("Approval failed");
            }

            // Execute swap
            bool zeroForOne = instruction.tokenIn < USDC;
            PoolId poolId = instruction.poolKey.toId();

            BalanceDelta delta = poolManager.swap(
                instruction.poolKey,
                IPoolManager.SwapParams({
                    zeroForOne: zeroForOne,
                    amountSpecified: int256(instruction.amountIn),
                    sqrtPriceLimitX96: zeroForOne ? TickMath.MIN_SQRT_PRICE + 1 : TickMath.MAX_SQRT_PRICE - 1
                }),
                instruction.hookData
            );

            // Calculate USDC received
            uint256 usdcOut = zeroForOne ? uint256(-delta.amount1()) : uint256(-delta.amount0());
            if (usdcOut < instruction.minUsdcOut) {
                revert SwapFailed(instruction.tokenIn, instruction.amountIn);
            }

            // Reset approval to 0 for security
            if (!tokenIn.approve(address(poolManager), 0)) {
                revert InvalidInput("Approval reset failed");
            }

            emit SwapCompleted(instruction.tokenIn, instruction.amountIn, usdcOut);
            totalUsdcReceived += usdcOut;
        }

        emit BatchSwapExecuted(target, nonce, instructions.length, totalUsdcReceived);
        return abi.encode(totalUsdcReceived);
    }

    // Validate PoolKey
    function isValidPool(PoolKey memory poolKey) internal view returns (bool) {
        // Ensure pool involves USDC and is initialized
        return (poolKey.currency0.toAddress() == USDC || poolKey.currency1.toAddress() == USDC) &&
               poolKey.hooks == address(this) &&
               poolKey.fee != 0;
    }

    // Allow user to invalidate a nonce
    function invalidateNonce(uint256 nonce) external {
        usedNonces[msg.sender][nonce] = true;
        emit NonceInvalidated(msg.sender, nonce);
    }

    // Uniswap V4 hook functions
    function getHookCalls() public pure override returns (Hooks.Calls memory) {
        return Hooks.Calls({
            beforeInitialize: false,
            afterInitialize: false,
            beforeModifyPosition: false,
            afterModifyPosition: false,
            beforeSwap: false,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false
        });
    }

    function afterSwap(
        address,
        PoolId,
        BalanceDelta delta,
        bytes calldata
    ) external override returns (bytes4) {
        return BaseHook.afterSwap.selector;
    }

    // Implement remaining hook functions
    function beforeInitialize(address, PoolKey calldata, uint160, bytes calldata) external pure override returns (bytes4) {
        return BaseHook.beforeInitialize.selector;
    }
    function afterInitialize(address, PoolKey calldata, uint160, int24, bytes calldata) external pure override returns (bytes4) {
        return BaseHook.afterInitialize.selector;
    }
    function beforeModifyPosition(address, PoolKey calldata, IPoolManager.ModifyPositionParams calldata, bytes calldata) external pure override returns (bytes4) {
        return BaseHook.beforeModifyPosition.selector;
    }
    function afterModifyPosition(address, PoolKey calldata, IPoolManager.ModifyPositionParams calldata, BalanceDelta, bytes calldata) external pure override returns (bytes4) {
        return BaseHook.afterModifyPosition.selector;
    }
    function beforeDonate(address, PoolKey calldata, uint256, uint256, bytes calldata) external pure override returns (bytes4) {
        return BaseHook.beforeDonate.selector;
    }
    function afterDonate(address, PoolKey calldata, uint256, uint256, bytes calldata) external pure override returns (bytes4) {
        return BaseHook.afterDonate.selector;
    }
}