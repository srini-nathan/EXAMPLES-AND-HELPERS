import { ethers } from "ethers"

import { CONTRACT_ADDRESS } from '../constants'
import { executorSignature, encodeFunctionData, safeNonce} from "../utils"
import { types } from "../EIP712"
import { sign } from "crypto"
const { abi } = require("../artifacts/contracts/GnosisSafe.sol/GnosisSafe.json")

// For this example we will just transfer eth, we have 2 signers and a threshold of 2.
// owner1 is before owner2 in a sortted format. Therefore, owner1 signature's goes first.
// owner1 will be the first to sign and owner2 will send the transaction.
const owner1 = new ethers.Wallet("privatekey1")
const owner2 = new ethers.Wallet("privatekey2")

const provider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/2598d2302edb4d26914e38c5759fbbcb")

//signer2 (executor)
const contractSigner2 = new ethers.Contract(CONTRACT_ADDRESS, abi, owner2.connect(provider))



//////////////////////////////////////// PARAMS ////////////////////////////////////////
const _to = "0x11a9E352394aDD8596594422A6d8ceA59B73aF0e" //receiver of the eth
// We are sending 0.01 ether.
const amount = ethers.utils.parseEther("0.01")
// Data transaction is "0x" because we are sending ether.
const txData = "0x"
const _operation = 0
const _safeTxGas = 0
const _baseGas = 0
const _gasPrice = 0 
const _gasToken =  "0x0000000000000000000000000000000000000000"//gasToken,
const _refundReceiver = "0x0000000000000000000000000000000000000000"//refundReceiver

///////////////////////////////////////////////////////////////////////////////////////////////

//EIP 712 SIGNATURE
const EIP712Signature = async ( ) : Promise <string | undefined> => {
    const _chainId = 4 //rinkeby
    const _nonce = await safeNonce()
    const domain = {
        chainId: _chainId,
        verifyingContract: CONTRACT_ADDRESS
    }
    const txMessage = {
        to: _to, //address recepient (it is not the safe, we are sending ether)
        value: amount,
        data: txData,
        operation: _operation, 
        safeTxGas: _safeTxGas, 
        baseGas: _baseGas, 
        gasPrice: _gasPrice,
        gasToken: _gasToken,
        refundReceiver: _refundReceiver,
        nonce: _nonce
    }
    const _signature = await owner1._signTypedData(domain, types, txMessage)  //owner1 signature
    return _signature.slice(2,) //Eliminating "0x" prefix.
}


// EXECUTE TRANSACTION
const execute = async () : Promise <string | undefined > => {
    const _signature1 = await EIP712Signature()
    const signature1 = `0x${_signature1}` //we add the 0x because the signature goes first (sortted before).
    const signature2 = executorSignature(owner2.address)
    const signatures = signature1 + signature2
    const result = await contractSigner2.execTransaction(
        _to, 
        amount.toString(), //so we don't have bigNumber issues, always convert it toString()
        txData, 
        _operation, 
        _safeTxGas, 
        _baseGas, 
        _gasPrice, 
        _gasToken, 
        _refundReceiver, 
        signatures
    )
    return result
}

