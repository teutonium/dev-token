

const TeutToken = artifacts.require("TeutToken");


// Start a test series named DevToken, it will use 10 test accounts 
contract("TeutToken", async accounts => {
    // each it is a new test, and we name our first test initial supply
    it("initial supply", async () => {
        // wait until devtoken is deplyoed, store the results inside devToken
        // the result is a client to the Smart contract api
        teutToken = await TeutToken.deployed();
        // call our totalSUpply function
        let supply = await teutToken.totalSupply();

        // Assert that the supply matches what we set in migration
        assert.equal(supply.toNumber(), 5000000, "Initial supply was not the same as in migration")
        
    })


    it("minting", async() => {
        teutToken = await TeutToken.deployed(); 

        // Let's use account 1 since that account should have 0 
        let intial_balance = await teutToken.balanceOf(accounts[1]);

        // Let's verify the balance
        assert.equal(intial_balance.toNumber(), 0, "intial balance for account 1 should be 0")

        // Let's mint 100 tokens to the user and grab the balance again
        let totalSupply = await teutToken.totalSupply();
        await teutToken.mint(accounts[1], 100);
        // Grab the balance again to see what it is after calling mint
        let after_balance = await teutToken.balanceOf(accounts[1]);
        let after_supply = await teutToken.totalSupply();
        // Assert and check that they match
        assert.equal(after_balance.toNumber(), 100, "The balance after minting 100 should be 100")
        assert.equal(after_supply.toNumber(), totalSupply.toNumber()+100, "The totalSupply should have been increasesd")

        try {
            // Mint with address 0
            await teutToken.mint('0x0000000000000000000000000000000000000000', 100);
        }catch(error){
            assert.equal(error.reason, "TeutToken: cannot mint to zero address", "Failed to stop minting on zero address")
        }
    })
    
    it("burning", async() => {
        teutToken = await TeutToken.deployed();

        // Let's continue on account 1 since that account now has 100 tokens
        let initial_balance = await teutToken.balanceOf(accounts[1]);

        // Burn to address 0 
        try{
            await teutToken.burn('0x0000000000000000000000000000000000000000', 100);
        }catch(error){
            assert.equal(error.reason, "TeutToken: cannot burn from zero address", "Failed to notice burning on 0 address")
        }

        // Burn more than balance
        try {
            await teutToken.burn(accounts[1], initial_balance+initial_balance);
        }catch(error){
            assert.equal(error.reason, "TeutToken: Cannot burn more than the account owns", "Failed to capture too big burns on an account")
        }

        let totalSupply = await teutToken.totalSupply();
        try {
            await teutToken.burn(accounts[1], initial_balance - 50);
        }catch(error){
            assert.fail(error);
        }

        let balance = await teutToken.balanceOf(accounts[1]);


        // Make sure balance was reduced and that totalSupply reduced
        assert.equal(balance.toNumber(), initial_balance-50, "Burning 50 should reduce users balance")

        let newSupply = await teutToken.totalSupply();

        assert.equal(newSupply.toNumber(), totalSupply.toNumber()-50, "Total supply not properly reduced")
    })

    it("transfering tokens", async() => {
        teutToken = await TeutToken.deployed();

        // Grab initial balance
        let initial_balance = await teutToken.balanceOf(accounts[1]);

        // transfer tokens from account 0 to 1 
        await teutToken.transfer(accounts[1], 100);
        
        let after_balance = await teutToken.balanceOf(accounts[1]);

        assert.equal(after_balance.toNumber(), initial_balance.toNumber()+100, "Balance should have increased on reciever")
    
        // We can change the msg.sender using the FROM value in function calls.
        let account2_initial_balance = await teutToken.balanceOf(accounts[2]);

        await teutToken.transfer(accounts[2], 20, { from: accounts[1]});
        // Make sure balances are switched on both accounts
        let account2_after_balance = await teutToken.balanceOf(accounts[2]);
        let account1_after_balance = await teutToken.balanceOf(accounts[1]);

        assert.equal(account1_after_balance.toNumber(), after_balance.toNumber()-20, "Should have reduced account 1 balance by 20");
        assert.equal(account2_after_balance.toNumber(), account2_initial_balance.toNumber()+20, "Should have givne accounts 2 20 tokens");
    

        // Try transfering too much
        try {
            await teutToken.transfer(accounts[2], 2000000000000, { from:accounts[1]});
        }catch(error){
            assert.equal(error.reason, "TeutToken: cant transfer more than your account holds");
        }
       
    })

});
