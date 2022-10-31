# Lottery-DApp
This project was created for the Greenhouse hack 2, organized by Algorand and hosted on Gitcoin.

The DApp allows users to create a lottery of teir choice depending on their usecase. After which, other users can buy lottery tickets which come with random numbers attached to them. 

There are several rounds in a lottery and a winner is chosen for each round and gets 50% of the total amount raised at each timed round. The rounds contine at intervals until the target amount specified by the lottery organizer is met. Additionally, the ticket price increases by 25% each round and the lottery organiser gets the remainder of the funds i.e the total amount raised less the amounts paid out.

The end game is for users to be able to organize and host lotteries based on their specific use case.

Getting Started
Pre-requisites and Local Development
Developers using this DApp should already have Reach, Docker and Node installed on their local machines.

The guidelines for installation can be found below
Instructions for installing Reach and Docker
Instructions for installing Node
In addition, they should have an Algorand wallet (preferably Pera Algo Wallet) installed on their phone and loaded with Testnet Algos in order to be able to sign transactions and contribute to proposals. The wallet can be installed from the App store (i-Phone) or Google Play (Android) as is appropiate.

You can some testnet Algos from the Algo Faucet.

Running the DApp
We recommend running the DApp using Ubuntu20.04 terminal.

Steps
Fork the Repository.

Clone the Repository.

Change Directory (cd) into the directory.

Run the following commands to start up the app:

npm install
./reach react
Usage
Please be aware that you would have to sign multiple transactions on your mobile device while going through most of the steps below.

Open a few tabs in your favourite browser (we recommend at least 3 tabs).

Navigate to the app at the URL http://localhost:3000.

Click on the Connect Wallet button to activate wallet connect and scan the QR code.

Click on the Deploy button to deploy the contract as an Admin in the first tab.

Copy the contract information to the clipboard by clicking on the Copy to Clipboard button and then head on over to the next tab and follow steps 1 - 3 after which you can attach to the contract as a new user by clicking on Attach and pasting the contract information and clicking on the the button to attach.

You would be greeted by the page to either start a lottery or join an existing lottery.

Please join in another browser and attach as per the steps above after which you can buy tickets and follow the same steps to buy more tickets and play around with the functionality of the DApp.


We encourage you to play around with the DApp and create as many auctions as you want and buy as amny tickets as you want as well. Adjusting the parameters to fit several use cases as you go along.

Troubleshooting
Module not found: can't reslove 'react-icons/im'
If you get the error below:

example

Please run the following commands:

npm install react-icons
./reach react
docker: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
If you get the error below:

example2

Please run the following commands:

sudo service docker stop
sudo service docker start
./reach react
Should you encounter any other errors, please tag either goonerlabs#1008 0r Emmanuel Agbavwe#2954 in the help channel of the Reach Discord Server.

The DApp
The Landing page
welcome to the hub

The Proposals Page
Proposals

The Bounties Page
Bounties

Authors
Owolabi Adeyemi
Emmanuel Agbavwe
Acknowledgements
JP Miller
Nick Stanford
And the Reach team, the Algorand Foundation and Gitcoin.
Contributing
This project is open to contributions from great minded developers who share our goal to make development easier, and to bring more developers into Web3 through the Reach Lang and by building on the Algorand network.

To contribute, simply:

Fork this repo, make your updates and additions.
Create a GitHub discussion and bring your new ideas to our notice.
Once approved, set up a pull request.
After revision, your name will forever be among the wonderful develpers who contributed to building Reach DAO.
