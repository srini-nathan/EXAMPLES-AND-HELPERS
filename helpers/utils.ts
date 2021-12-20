import { ethers } from "ethers"

import { CONTRACT_ADDRESS } from "./constants"
const { toChecksumAddress } = require('ethereum-checksum-address')
const { abi } = require("./artifacts/contracts/GnosisSafe.sol/GnosisSafe.json")
const provider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/2598d2302edb4d26914e38c5759fbbcb")
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider )
/**
 * Encodes the given information.
 * @param abi the abi of the contract.
 * @param functionName the name of the function.
 * @param _params the parameters of the function to be called (from the contract).
 * @returns the encoded data to be attached as "data" in the transaction.
 */
 export const encodeFunctionData = (abi:any, functionName:string, ..._params: any[]) :string => {
    const params = _params[0] //Eliminating one array layer.
    const iface = new ethers.utils.Interface(abi)
    const data = iface.encodeFunctionData(functionName, params)
    return data
}

/**
 * Decodes the data into a readable object. This is useful to double check any information.
 * @param abi the abi of the contract.
 * @param _data the data to be decoded.
 * @returns an object with the relevant data.
 */
 export const decodeFunctionData = (abi:any, _data:string):object => {
    const InputDataDecoder = require('ethereum-input-data-decoder')
    const decoder = new InputDataDecoder(abi)
    return decoder.decodeData(_data)
}

/**
 * @param address the address to be checksumed.
 * @returns checksumed address.
 */
 export const checksumAddress = (address:string):string => {
    try {
        return toChecksumAddress(address)
    } catch(e) {
        console.log(`error:${e}`)
        return `error:${e}`
    }
}

/**
 * @returns the owners of the contract in a sorted array.
 */
 export const sortedSafeOwners = async (): Promise<string[]> => {
    const notSortedOwners = await contract.getOwners()
    const sortedOwners = [...notSortedOwners].sort()
    console.log(sortedOwners)
    return sortedOwners
}

/**
 * @param address address of the owner executing the transaction.
 * @returns the signature in correct format.
 */
 export const executorSignature = (_address:string):string => {
    let address:string
    try {
        address = checksumAddress(_address)
    } catch(e) {
        console.log(`error:${e}`)
        return `error:${e}`
    }
   // Removing 0x prefix.
   address = _address.slice(2,)
   // First 32 bytes (signature verifier).
   const signatureVerifier = "000000000000000000000000" + address
   // Second 32 bytes (data position).
   const dataPosition = "00000000000000000000000000000000000000000000000000000000000000000"
   // Last byte (signature type).
   const signatureType = "1"
   const signature = signatureVerifier + dataPosition + signatureType
   return signature
}

/**
 * Gets the nonce of the safe.
 * @returns the nonce of the safe (+1), so the next transaction can be executed.
 */
 export const safeNonce = async () : Promise<string> => {
    let nonce:string
    try {
        nonce = await contract.nonce()
        
        return nonce.toString()
    } catch(e) {
        return `error:${e}`
    }
}

/**
 * Returns the hash of the transaction. This hash needs to be signed by the owners if 
 * there is more than 1.
 * @param to the receiver of the transaction. If it is an internal transaction then
 * it needs to be the address of the safe.
 * @param value the amount in wei to be sent (0 if it is an internal transaction).
 * @param data the data of the transaction (encodeFunctionData()).
 * @param operation 0 for CALL and 1 for DELEGATE_CALL.
 * @returns the hash of the transacti on to be signed by owners given owners > 1.
 */
 export const transactionHash = async (
    to:string,
    value:string | number,
    data:string,
    operation:string|number,
    safeTxGas:string|number,
    baseGas:string|number,
    gasPrice:string|number,
    gasToken:string,
    refundReceiver:string
):Promise<string> => {
    const nonce = await safeNonce()
    let hash: string
    try {
        hash = await contract.getTransactionHash(
            to,value,data, operation, safeTxGas, baseGas, 
            gasPrice, gasToken, refundReceiver, nonce
        )
        console.log(hash)
        return hash
    } catch(e) {
        console.log(e)
        return `error:${e}`
    }
}