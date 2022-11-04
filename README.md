# Lottery-DApp
This project was created for the Greenhouse hack 2, organized by Algorand and hosted on Gitcoin.

The DApp allows users to create a lottery of their choice depending on their peculiar usecase. After which, other users can buy lottery tickets which come with random numbers attached to them. 

There are several rounds in a lottery and a winner is chosen for each round and gets 50% of the total amount raised round while the lottery creator gets the other 50%. A round ends when 5 tickets have been bought. The rounds continue until the accumulated amount paid to the lottery creator is equal to the target amount specified. Additionally, the ticket price increases by 25% anytime a deadline is encountered in a round.

The end game is for users to be able to organize and host lotteries based on their specific use case.

## Getting Started
### Pre-requisites and Local Development
Developers using this DApp should already have Reach, Docker and Node installed on their local machines.

### The guidelines for installation can be found below
[Instructions for installing Reach and Docker](https://docs.reach.sh/quickstart/)
[Instructions for installing Node](https://nodejs.org/en/download/)

In addition, they should have an Algorand wallet (preferably Pera Algo Wallet) installed on their phone and loaded with Testnet Algos in order to be able to sign transactions and buy tickets. The wallet can be installed from the App store (i-Phone) or Google Play (Android) as is appropiate.

[You can some testnet Algos from the Algo Faucet](https://bank.testnet.algorand.network/)

## Running the DApp
We recommend running the DApp using Ubuntu20.04 terminal.

### Steps
- Fork the Repository.

- Clone the Repository.

- Change Directory (cd) into the directory.

- Run the following commands to start up the app:

```sh
npm install

./reach react
```

## Usage

Please be aware that you would have to sign multiple transactions on your mobile device while going through most of the steps below.

- Open a few tabs in your favourite browser (we recommend at least 6 tabs).

- Navigate to the app at the URL http://localhost:3000.

- Click on the Connect Wallet button to activate wallet connect and scan the QR code.

- Click on the Deploy button to deploy the contract as the lottery creator in the first tab.

- Copy the contract information to the clipboard by clicking on the Copy to Clipboard button and then head on over to the next tab and follow steps 1 - 3 after which you can attach to the contract as a new user by clicking on Attach and pasting the contract information and clicking on the the button to attach.

- You would be greeted by the page to either start a lottery or join an existing lottery.

- Please join in another browser and attach as per the steps above after which you can buy tickets and follow the same steps to buy more tickets and play around with the functionality of the DApp.


We encourage you to play around with the DApp and create as many lotteries as you want and buy as many tickets as you want as well. Adjusting the parameters to fit several use cases as you go along.

## Troubleshooting
- Module not found: can't reslove 'react-icons/im'

If you get this error,

Please run the following commands:

```sh npm install react-icons ```

```sh ./reach react ```

- docker: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?

If you get this error:

Please run the following commands:

```sh
sudo service docker stop

sudo service docker start

./reach react
```

Should you encounter any other errors, please tag either goonerlabs#1008 0r Emmanuel Agbavwe#2954 on discord.

## Authors

Owolabi Adeyemi

Emmanuel Agbavwe

## Acknowledgements

JP Miller

Nick Stanford

And the Reach team, the Algorand Foundation and Gitcoin.
