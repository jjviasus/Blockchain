const SHA256 = require('crypto-js/sha256');

class Block {
    /**
     * 
     * @param {*} index (Optional) tells us where the block sits on the chain
     * @param {*} timestamp Tells us when the block was created
     * @param {*} data The data associated with the block
     * @param {*} previousHash String that contains the hash of the block before this one (Ensures integrity of the blockchain)
     */
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash(); // Contains the hash of the block
        this.nonce = 0; // A random number
    }

    /**
     * Calculates the hash of the block. Returns a SHA256 hash of the block's properties
     */
    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
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
        this.difficulty = 5;
    }

    // The first block on the blockchain is called the genesis block
    createGenesisBlock() {
        // previous hash does not matter for the genesis block
        return new Block(0, "01/01/2017", "Genesis block", "0");
    }

    /**
     * Returns the latest block on the chain
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Adds a new block to the chain
     */
    addBlock(newBlock) {
        // Set the previous hash to the hash of the latest block
        newBlock.previousHash = this.getLatestBlock().hash;
        
        // Recalculate the hash of the new block
        newBlock.mineBlock(this.difficulty); // Any time we change a property of a block, the hash should change as well.

        // Add the new block to the chain
        this.chain.push(newBlock);
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

let bitCoin = new Blockchain();

console.log('Mining block 1...');
bitCoin.addBlock(new Block(1, "10/07/2017", { amount: 4 }));
console.log('Mining block 2...');
bitCoin.addBlock(new Block(2, "12/07/2017", { amount: 10 }));

console.log('Is blockchain valid? ' + bitCoin.isChainValid());
// console.log(JSON.stringify(bitCoin, null, 4));

bitCoin.chain[1].data = { amount: 100 }
bitCoin.chain[1].hash = bitCoin.chain[1].calculateHash();
// Not valid because the relationship with its neighboring blocks have been broken
console.log('Is blockchain valid? ' + bitCoin.isChainValid());

// The blockchain is meant to add blocks to it but to never delete a block and to never change a block






