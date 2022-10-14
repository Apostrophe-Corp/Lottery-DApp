/* eslint-disable no-loop-func */
/* eslint-disable no-use-before-define */
/* eslint-disable no-array-constructor */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
'reach 0.1'

// Types
const numOfTickets = 5
const tickets = Array(UInt, numOfTickets)

const state = Bytes(20)

// Outcomes
const [isOutcome, WON, LOST] = makeEnum(2)
const winner = (winningTicket, pickedTicket) => {
	return winningTicket == pickedTicket ? WON : LOST
}

assert(isOutcome(winner(3, 4)))
assert(isOutcome(winner(5, 5)))
assert(winner(6, 7) == LOST)
assert(winner(8, 8) == WON)

forall(UInt, (winningTicket) => {
	forall(UInt, (pickedTicket) => {
		assert(isOutcome(winner(winningTicket, pickedTicket)))
	})
})

export const main = Reach.App(() => {
	const Deployer = Participant('Deployer', {
		setupContract: Fun([], Array(UInt, 3)),
		generate: Fun(
			[UInt],
			Object({
				generatedTickets: tickets,
				winningIndex: UInt,
			})
		),
	})

	const Players = API('Players', {
		drawATicket: Fun([], UInt),
	})

	const Logger = Events({
		log: [state],
		logOpened: [state, UInt],
		price: [UInt],
		notify: [Address, UInt],
		round: [UInt],
		balance: [UInt],
		announce: [Address, UInt, Bool, UInt],
	})

	init()
	Deployer.only(() => {
		const [deadline, paymentAmount, target] = declassify(
			interact.setupContract()
		)
	})
	Deployer.publish(deadline, paymentAmount, target)
	Logger.log(state.pad('initiating'))
	commit()
	Deployer.publish()

	var [rounds, currentBal, totalGathered] = [1, balance(), 0]
	invariant(balance() == currentBal)
	while (totalGathered < target) {
		commit()

		Deployer.only(() => {
			const { generatedTickets, winningIndex } = declassify(
				interact.generate(numOfTickets)
			)
		})
		Deployer.publish(generatedTickets, winningIndex)
		Logger.price(paymentAmount)
		Logger.round(rounds)

		const [timeRemaining, keepGoing] = makeDeadline(deadline)
		Logger.logOpened(state.pad('opened'), deadline)
		const [outcome, currentOwner, currentBalance, playerCount, amtCont] =
			parallelReduce([LOST, Deployer, balance(), 0, 0])
				.invariant(balance() == currentBalance)
				.while(keepGoing() && playerCount < 5)
				.api_(Players.drawATicket, () => {
					return [
						paymentAmount,
						(notify) => {
							const ticketNumber = generatedTickets[playerCount]
							const verdict = winner(
								generatedTickets[winningIndex > 4 ? 0 : winningIndex],
								ticketNumber
							)
							const currentHolder = verdict == WON ? this : currentOwner
							notify(ticketNumber)
							Logger.notify(this, ticketNumber)
							return [
								verdict,
								currentHolder,
								currentBalance + paymentAmount,
								playerCount + 1,
								amtCont + paymentAmount,
							]
						},
					]
				})
				.timeout(timeRemaining(), () => {
					Deployer.publish()
					Logger.log(state.pad('timeout'))
					if (playerCount < 5) {
						commit()
						Deployer.publish()
						const increasedPayment = (paymentAmount / 100) * 125
						Logger.price(increasedPayment)
						Logger.logOpened(state.pad('opened'), deadline)
						const [
							tOutcome,
							tCurrentOwner,
							tCurrentBalance,
							tPlayerCount,
							tAmtCont,
						] = parallelReduce([
							outcome,
							currentOwner,
							currentBalance,
							playerCount,
							amtCont,
						])
							.invariant(balance() == tCurrentBalance)
							.while(tPlayerCount < 5)
							.api_(Players.drawATicket, () => {
								return [
									increasedPayment,
									(notify) => {
										const ticketNumber = generatedTickets[playerCount]
										const verdict = winner(
											generatedTickets[winningIndex > 4 ? 0 : winningIndex],
											ticketNumber
										)
										const currentHolder = verdict == WON ? this : currentOwner
										notify(ticketNumber)
										Logger.notify(this, ticketNumber)
										return [
											verdict,
											currentHolder,
											tCurrentBalance + increasedPayment,
											tPlayerCount + 1,
											tAmtCont + increasedPayment,
										]
									},
								]
							})
						return [
							tOutcome,
							tCurrentOwner,
							tCurrentBalance,
							tPlayerCount,
							tAmtCont,
						]
					} else {
						return [outcome, currentOwner, currentBalance, playerCount, amtCont]
					}
				})
		if (balance() >= amtCont / 2) {
			transfer(amtCont / 2).to(currentOwner)
		}
		Logger.balance(totalGathered + amtCont / 2)
		Logger.announce(
			currentOwner,
			generatedTickets[winningIndex > 4 ? 0 : winningIndex],
			balance() < target ? true : false,
			balance()
		)
		;[rounds, currentBal, totalGathered] = [
			rounds + 1,
			balance(),
			totalGathered + amtCont / 2,
		]
		continue
	}
	transfer(balance()).to(Deployer)
	commit()
	exit()
})
