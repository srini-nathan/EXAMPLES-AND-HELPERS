import { createHash, sign } from "crypto"
import { encodeFunctionData } from "./utils"

const TOKEN_TRANSFER_METHODS = {
    TRANSFER: 'transfer',
    TRANSFER_FROM: 'transferFrom'
} as const

/**
 * @dev Helper function to get the data for a token transfer.
 * @param tokenTransferMethod transfer | tranferFrom.
 * @param addressTo The recepient of the transfer.
 * @param amount  Amount of tokens to transfers (usually is 18 decimals) but it can vary on the contract.
 * @param addressSender If the method is TRANSFER_FROM, addressSender is the person executing the tx on behalf of.
 * @returns data of the transaction.
 */
//  export const tokenTransferData = (
//     tokenTransferMethod: string, 
//     addressTo: string,
//     amount: string | BigNumber,
//     addressSender? : string 
//     ) : string | undefined => {
//         let data: string
//         let tokenTransferAbi = []
//         if (tokenTransferMethod === "transfer") {
//             tokenTransferAbi = ["function transfer(address to, uint256 value) external"]
//             data = encodeFunctionData(tokenTransferAbi, tokenTransferMethod, [addressTo, amount])
//             return data
//         }
//         else if (tokenTransferMethod === "transferFrom") {
//             tokenTransferAbi = ["function transferFrom(address sender, address recipient, uint256 amount)"]
//             data = encodeFunctionData(tokenTransferAbi, tokenTransferMethod, [addressSender, addressTo, amount])
//         }
//     }

