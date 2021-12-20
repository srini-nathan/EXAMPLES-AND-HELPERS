import { ethers } from "ethers"

import { CONTRACT_ADDRESS } from '../constants'
import { executorSignature, encodeFunctionData, safeNonce} from "../utils"
import { types } from "../EIP712"
import { sign } from "crypto"
const { abi } = require("../artifacts/contracts/GnosisSafe.sol/GnosisSafe.json")

// For this example we will change the threshold to 1.
// owner1 is AFTER owner2 in a sortted format. Therefore, owner1 signature's goes second.
// owner2 will be the first to sign and owner1 will send the transaction.
const owner1 = new ethers.Wallet("privatekey1")
const owner2 = new ethers.Wallet("privatekey2")

const provider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/2598d2302edb4d26914e38c5759fbbcb")

//signer2 (executor)
const contractSigner1 = new ethers.Contract(CONTRACT_ADDRESS, abi, owner1.connect(provider))


//////////////////////////////////////// PARAMS ////////////////////////////////////////
const _to = CONTRACT_ADDRESS //internal tx, therefore, the address of the safe. 
const amount = "0"
const txData = encodeFunctionData(abi, "changeThreshold", [1])
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
    const _signature = await owner2._signTypedData(domain, types, txMessage)  //owner2 signature
    return _signature.slice(2,) //Eliminating "0x" prefix.
}


// EXECUTE TRANSACTION
const execute = async () : Promise <string | undefined > => {
    const _signature1 = await EIP712Signature()
    const signature1 = executorSignature(owner1.address)
    const signature2 = `0x${await EIP712Signature()}` 
    const signatures = signature2 + signature1
    const result = await contractSigner1.execTransaction(
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

execute()