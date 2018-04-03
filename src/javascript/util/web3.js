import { promisify } from "bluebird";
import * as Web3 from "web3";

export class Web3Service {

    static _instance = null;
    init(dispatch, getState) {
        Web3Service._instance = new Web3Service();
    }

    constructor() {
        this.rawWeb3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        // this.getBlockNumber = promisify(this.rawWeb3.eth.getBlockNumber);
        // this.getBlock = promisify(this.rawWeb3.eth.getBlock);
        // this.getTransaction = promisify<any, string>(this.rawWeb3.eth.getTransaction);
        // this.getTransactionReceipt = promisify<any, string>(this.rawWeb3.eth.getTransactionReceipt);
        this.getBalance = promisify(this.rawWeb3.eth.getBalance);
    }    
}