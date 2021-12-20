
/**
 * Executes a safe transaction.
 * @param to the receiver of the transaction. If it is an internal transaction then
 * it needs to be the address of the safe.
 * @param value the amount in wei to be sent (0 if it is an internal transaction).
 * @param data the data of the transaction (encodeFunctionData()).
 * @param operation 0 for CALL and 1 for DELEGATE_CALL.
 * @param signatures bundled signatures in ascending order. 
 */
 export const executeSafeTransaction = async (
    to:string,
    value:string | number,
    data:string,
    operation:string|number,
    safeTxGas:string|number,
    baseGas:string|number,
    gasPrice:string|number,
    gasToken:string,
    refundReceiver:string,
    signatures:string
): Promise<string> => {
    try {
        await contract.execTransaction( // add contract
            to, value, data, operation, safeTxGas, baseGas, 
            gasPrice, gasToken, refundReceiver, signatures
        )
        console.log("success")
        return "success"
    } catch(e) {
        console.log(`error:${e}`)
        return `error:${e}`
    }
}

