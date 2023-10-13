#!/usr/bin/env node
const ethers = require("ethers")
const commander = require("commander")
const dotenv = require("dotenv")
const fs = require("fs")

dotenv.config({ path: '../.env' })

async function main() {
  const { initialize } = await import("zokrates-js")
  const zokratesProvider = await initialize()

  function writeToFile(proofData, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(proofData, null, 2))
  }

  function readFromFile(filePath) {
    const data = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(data)
  }

  async function createProof(zokratesProvider, input) {
    const privateKey = process.env.PRIVATE_KEY
    const wallet = new ethers.Wallet(privateKey)
    const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/arbitrum")

    const source = fs.readFileSync("constrains/main.zok", "utf-8")
    const artifacts = zokratesProvider.compile(source)

    const keypair = zokratesProvider.setup(artifacts.program)
    writeToFile(keypair, "verification_key.json")
    console.log(`verification key was saved to: src/verification_key.js.`)
    
    const balance = await provider.getBalance(wallet.address)

    const { witness, output } = zokratesProvider.computeWitness(artifacts, [balance.toString(), input.toString()]) 
    const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk)
    writeToFile(proof, "proof.json");
    console.log(`proof was saved to: src/proof.json.`)
  };

  function verifyProof(zokratesProvider) {
    const proof = readFromFile("proof.json");
    const keypair = readFromFile("verification_key.json")
    const isVerified = zokratesProvider.verify(keypair.vk, proof)

    if (isVerified) {
      console.log(`prover has an ethereum wallet with more than ${parseInt(proof.inputs)} wei.`)
    } else {
      console.log(`Invalid proof.`)
    }
  };

  commander
    .version("1.0.0")
    .description("A CLI app to create and verify Zokrates proofs")

  commander
    .command("create-proof")
    .description("Create a Zokrates proof")
    .action((input) => {
      createProof(zokratesProvider, input)
    });

  commander
    .command("verify-proof")
    .description("Verify a Zokrates proof")
    .action(() => {
      verifyProof(zokratesProvider)
    });

  commander.parse(process.argv)
}

main()