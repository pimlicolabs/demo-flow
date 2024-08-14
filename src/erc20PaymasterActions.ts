import { UserOperation, deepHexlify } from "permissionless";
import { SponsorUserOperationReturnType } from "permissionless/actions/pimlico";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types/entrypoint";
import { Address, Chain, Client, PartialBy, Prettify, Transport } from "viem";

export type Erc20SponsorUserOperationParameters = {
	userOperation: PartialBy<
		UserOperation<"v0.7">,
		| "callGasLimit"
		| "preVerificationGas"
		| "verificationGasLimit"
		| "paymasterVerificationGasLimit"
		| "paymasterPostOpGasLimit"
	>;
	token: Address;
	entryPoint: ENTRYPOINT_ADDRESS_V07_TYPE;
};

export const sponsorUserOperation = async (
	client: Client<Transport, Chain>,
	args: Prettify<Erc20SponsorUserOperationParameters>,
): Promise<
	Prettify<SponsorUserOperationReturnType<ENTRYPOINT_ADDRESS_V07_TYPE>>
> => {
	const res = (await client.request({
		// @ts-ignore in prod this will be strongly typed
		method: "pm_erc20SponsorUserOperation",
		params: [deepHexlify(args.userOperation), args.token, args.entryPoint],
	})) as any;

	return {
		callGasLimit: BigInt(res.callGasLimit),
		verificationGasLimit: BigInt(res.verificationGasLimit),
		preVerificationGas: BigInt(res.preVerificationGas),
		paymaster: res.paymaster,
		paymasterVerificationGasLimit: BigInt(res.paymasterVerificationGasLimit),
		paymasterPostOpGasLimit: BigInt(res.paymasterPostOpGasLimit),
		paymasterData: res.paymasterData,
	} as SponsorUserOperationReturnType<ENTRYPOINT_ADDRESS_V07_TYPE>;
};

export const getApprovalAmount = async (
	client: Client<Transport, Chain>,
	args: Prettify<Erc20SponsorUserOperationParameters>,
): Promise<Prettify<bigint>> => {
	const res = (await client.request({
		// @ts-ignore in prod this will be strongly typed
		method: "pm_erc20GetMaxCost",
		params: [deepHexlify(args.userOperation), args.token, args.entryPoint],
	})) as any;

	return BigInt(res);
};

export const pimlicoERC20Actions = (client: Client<Transport, Chain>) => ({
	sponsorUserOperation: async (
		args: Prettify<Erc20SponsorUserOperationParameters>,
	) => sponsorUserOperation(client, args),
	getApprovalAmount: async (
		args: Prettify<Erc20SponsorUserOperationParameters>,
	) => getApprovalAmount(client, args),
});
