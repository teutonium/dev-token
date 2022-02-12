
const TeutToken = artifacts.require("TeutToken");
const helper = require("./helpers/truffleTestHelpers");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
contract("TeutToken", async accounts => {
    it("Staking 100x2", async () => {
        teutToken = await TeutToken.deployed();

        // Stake 100 is used to stake 100 tokens twice and see that stake is added correctly and money burned
        let owner = accounts[0];
        // Set owner, user and a stake_amount
        let stake_amount = 100;
        // Add som tokens on account 1 asweel
        await teutToken.mint(accounts[1], 1000);
        // Get init balance of user
        balance = await teutToken.balanceOf(owner)

        // Stake the amount, notice the FROM parameter which specifes what the msg.sender address will be

        stakeID = await teutToken.stake(stake_amount, { from: owner });
        // Assert on the emittedevent using truffleassert
        // This will capture the event and inside the event callback we can use assert on the values returned
        truffleAssert.eventEmitted(
            stakeID,
            "Staked",
            (ev) => {
                // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
                assert.equal(ev.amount, stake_amount, "Stake amount in event was not correct");
                assert.equal(ev.index, 1, "Stake index was not correct");
                return true;
            },
            "Stake event should have triggered");

                    // Stake again on owner because we want hasStake test to assert summary

        stakeID = await teutToken.stake(stake_amount, { from: owner });
        // Assert on the emittedevent using truffleassert
        // This will capture the event and inside the event callback we can use assert on the values returned
        truffleAssert.eventEmitted(
            stakeID,
            "Staked",
            (ev) => {
                // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
                assert.equal(ev.amount, stake_amount, "Stake amount in event was not correct");
                assert.equal(ev.index, 1, "Stake index was not correct");
                return true;
            },
            "Stake event should have triggered");

    });

    it("cannot stake more than owning", async() => {

        // Stake too much on accounts[2]
        teutToken = await TeutToken.deployed();

        try{
            await teutToken.stake(1000000000, { from: accounts[2]});
        }catch(error){
            assert.equal(error.reason, "TeutToken: Cannot stake more than you own");
        }
    });

    it("new stakeholder should have increased index", async () => {
        let stake_amount = 100;
        stakeID = await teutToken.stake(stake_amount, { from: accounts[1] });
        // Assert on the emittedevent using truffleassert
        // This will capture the event and inside the event callback we can use assert on the values returned
        truffleAssert.eventEmitted(
            stakeID,
            "Staked",
            (ev) => {
                // In here we can do our assertion on the ev variable (its the event and will contain the values we emitted)
                assert.equal(ev.amount, stake_amount, "Stake amount in event was not correct");
                assert.equal(ev.index, 2, "Stake index was not correct");
                return true;
            },
            "Stake event should have triggered");
    });

    it("cant withdraw bigger amount than current stake", async() => {
        teutToken = await TeutToken.deployed();

        let owner = accounts[0];

        // Try withdrawing 200 from first stake
        try {
            await teutToken.withdrawStake(200, 0, {from:owner});
        }catch(error){
            assert.equal(error.reason, "Staking: Cannot withdraw more than you have staked", "Failed to notice a too big withdrawal from stake");
        }
    });

    it("withdraw 50 from a stake", async() => {
        teutToken = await TeutToken.deployed();

        let owner = accounts[0];
        let withdraw_amount = 50;
        // Try withdrawing 50 from first stake
        await teutToken.withdrawStake(withdraw_amount, 0, {from:owner});
        // Grab a new summary to see if the total amount has changed
        let summary = await teutToken.hasStake(owner);

        assert.equal(summary.total_amount, 200-withdraw_amount, "The total staking amount should be 150");
        // Itterate all stakes and verify their amount aswell. 
        let stake_amount = summary.stakes[0].amount;

        assert.equal(stake_amount, 100-withdraw_amount, "Wrong Amount in first stake after withdrawal");
    });

    it("remove stake if empty", async() => {
        teutToken = await TeutToken.deployed();

        let owner = accounts[0];
        let withdraw_amount = 50;
        // Try withdrawing 50 from first stake AGAIN, this should empty the first stake
        await teutToken.withdrawStake(withdraw_amount, 0, {from:owner});
        // Grab a new summary to see if the total amount has changed
        let summary = await teutToken.hasStake(owner);
        console.log(summary);

        assert.equal(summary.stakes[0].user, "0x0000000000000000000000000000000000000000", "Failed to remove stake when it was empty");
    });
    

});