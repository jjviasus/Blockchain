const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    /**
     * @param {*} timestamp Tells us when the block was created
     * @param {*} transactions The data associated with the block
     * @param {*} previousHash String that contains the hash of the block before this one (Ensures integrity of the blockchain)
     */
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash(); // Contains the hash of the block
        this.nonce = 0; // A random number
    }

    /**
     * Calculates the hash of the block. Returns a SHA256 hash of the block's properties
     */
    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        // Create a string of zeros the size of the difficulty
        const stringOfZeros = Array(difficulty + 1).join("0");
        while(this.hash.substring(0, difficulty) !== stringOfZeros) { // makes a string of zeros that match the length of the difficulty
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }
}


class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100; // controls how many coins are given to miners when they mine a new block
    }

    // The first block on the blockchain is called the genesis block
    createGenesisBlock() {
        // previous hash does not matter for the genesis block
        return new Block("01/01/2017", "Genesis block", "0");
    }

    /**
     * Returns the latest block on the chain
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // In reality, miners get to pick the transactions they want to include in the block,
    // but for simplicity we will just add all pending transactions
    minePendingTransactions(miningRewardAddress) {
        // If a miner successfully mines a block, then a reward is sent to the given address
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        // Reset the pending transaction array and create a new transaction to give the miner they're reward
        this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)]; // Theres no from address because it is a reward (coming directly out of the system)
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }
    
    /**
     * Loops over all the blocks in the chain and returns all the transactions that match the given address
     * @param {*} address 
     */
    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for(const trans of block.transactions) {
                // If you were a fromAddress, then you sent money to someone else
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                // If you were a toAddress, then you received money from someone else
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }
    /**
     * 
     */
    isChainValid() {
        // We don't start with the genesis block
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                // The actual hash of the block does not match up with its properties
                return false;
            }

            // Check if the blocks are properly linked together
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

// Notice how long the mining takes as the difficulty increases
function miningExample() {
    console.log('miningExample');

    let bitCoin = new Blockchain();

    console.log('Mining block 1...');
    bitCoin.addBlock(new Block(1, "10/07/2017", { amount: 4 }));
    console.log('Mining block 2...');
    bitCoin.addBlock(new Block(2, "12/07/2017", { amount: 10 }));

    console.log();
}

// The blockchain is meant to add blocks to it but to never delete a block and to never change a block
function isChainValidExample() {
    console.log('isChainValidExample');

    let bitCoin = new Blockchain();
    bitCoin.addBlock(new Block(1, "10/07/2017", { amount: 4 }));
    bitCoin.addBlock(new Block(2, "12/07/2017", { amount: 10 }));

    console.log('Is blockchain valid? ' + bitCoin.isChainValid());
    // console.log(JSON.stringify(bitCoin, null, 4));

    bitCoin.chain[1].transactions = { amount: 100 }
    bitCoin.chain[1].hash = bitCoin.chain[1].calculateHash();
    // Not valid because the relationship with its neighboring blocks have been broken
    console.log('Is blockchain valid? ' + bitCoin.isChainValid());

    console.log();
}

function transactionExample() {
    let bitCoin = new Blockchain();
    bitCoin.createTransaction(new Transaction('address1', 'address2', 100));
    bitCoin.createTransaction(new Transaction('address2', 'address1', 50));

    console.log('\nStarting the miner...');
    bitCoin.minePendingTransactions('miners-address');

    console.log('\nBalance of miners address is:', bitCoin.getBalanceOfAddress('miners-address'));

    // The mining reward is only sent when the next block is mined
    console.log('\nStarting the miner again...');
    bitCoin.minePendingTransactions('another-miners-address');

    console.log('\nBalance of miners address is:', bitCoin.getBalanceOfAddress('miners-address'));
}

function main() {
    // miningExample();
    // isChainValidExample();
    transactionExample();
}

main();






