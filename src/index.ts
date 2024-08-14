import {
	ENTRYPOINT_ADDRESS_V07,
	createSmartAccountClient,
} from "permissionless";
import { signerToSafeSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import {
	Address,
	createClient,
	createPublicClient,
	encodeFunctionData,
	http,
	parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";
import { pimlicoERC20Actions } from "./erc20PaymasterActions";
import { Hex } from "viem";
import { tokenMap } from "./tokenMap";

// constants
const chain = polygon;
const RPC_URL = process.env.RPC_URL;
const PIMLICO_KEY = process.env.PIMLICO_KEY;
const BUNDLER_URL = `https://api-demo.pimlico.io/v2/${chain.id}/rpc?apikey=${PIMLICO_KEY}`;

// create clients
const publicClient = createPublicClient({
	transport: http(RPC_URL),
});
const bundlerClient = createPimlicoBundlerClient({
	chain,
	transport: http(BUNDLER_URL),
	entryPoint: ENTRYPOINT_ADDRESS_V07,
});
const erc20Paymaster = createClient({
	chain,
	transport: http(BUNDLER_URL),
}).extend(pimlicoERC20Actions);

const erc20PaymasterAddress = "0x2Ec2c2D9f5cEdE2b4c8bA9bb26212949a0016195";
const token = tokenMap[chain.id]["usdc"];

const main = async () => {
	const safe = await signerToSafeSmartAccount(publicClient, {
		signer: privateKeyToAccount(
			"0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
		),
		entryPoint: ENTRYPOINT_ADDRESS_V07,
		safeVersion: "1.4.1",
	});

	const smartAccountClient = createSmartAccountClient({
		account: safe,
		entryPoint: ENTRYPOINT_ADDRESS_V07,
		bundlerTransport: http(BUNDLER_URL),
		middleware: {
			gasPrice: async () =>
				(await bundlerClient.getUserOperationGasPrice()).fast,
			sponsorUserOperation: async ({ userOperation }) => {
				return erc20Paymaster.sponsorUserOperation({
					userOperation,
					entryPoint: ENTRYPOINT_ADDRESS_V07,
					token,
				});
			},
		},
	});

	// The calldata that we want to execute.
	const targetCallData = {
		to: "0x8139ABcd2d56F5639a2FD27edE021E26DE734E8d" as Address, // test counter contract
		data: "0x06661abd" as Hex, // result of: cast sig "count()"
		value: 0n,
	};

	const userOperation = await smartAccountClient.prepareUserOperationRequest({
		userOperation: {
			callData: await safe.encodeCallData([targetCallData]),
		},
	});

	const approvalAmount = await erc20Paymaster.getApprovalAmount({
		userOperation,
		entryPoint: ENTRYPOINT_ADDRESS_V07,
		token,
	});

	console.log(approvalAmount);

	const hash = await smartAccountClient.sendUserOperation({
		userOperation: {
			callData: await safe.encodeCallData([
				{
					to: token,
					value: 0n,
					data: encodeFunctionData({
						abi: parseAbi(["function approve(address,uint)"]),
						args: [erc20PaymasterAddress, approvalAmount],
					}),
				},
				targetCallData,
			]),
		},
	});

	const receipt = await bundlerClient.waitForUserOperationReceipt({ hash });

	console.log(
		`userOperation included in tx: ${receipt.receipt.transactionHash}`,
	);
};

main();
