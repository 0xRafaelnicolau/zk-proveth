## zk-proveth
Simple zokrates program designed to verify ownership of an Ethereum wallet with a minimum balance requirement. It enables users to prove their ownership of a public key with a specified amount of ETH.

### Usage
Clone the repository
```
git clone https://github.com/0xRafaelnicolau/zk-proveth.git && cd zk-proveth
```

Install dependencies
```
npm install 
```

Add you private key to the .env file
```
PRIVATE_KEY="YOUR_PRIVATE_KEY"
```

Prove that you own more than certain amount of ETH
```
cd src && node proveth.js create-proof <amount-in-wei>
```

Verify a proof
```
node proveth.js verify-proof
```

