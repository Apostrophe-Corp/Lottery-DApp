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

	const Fire = Events({
		initiated: [],
		// Round, Deadline, Price
		startRound: [UInt, UInt, UInt],
		// IncreasedAmount
		increasePrice: [UInt],
		// Winner, UInt
		notify: [Address, UInt],
		// Winner, Ticket, CanContinue, Balance
		announce: [Address, UInt, Bool, UInt],
	})

	init()
	Deployer.only(() => {
		const [deadline, paymentAmount, target] = declassify(
			interact.setupContract()
		)
	})
	Deployer.publish(deadline, paymentAmount, target)
	Fire.initiated()

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
		const [timeRemaining, keepGoing] = makeDeadline(deadline)
		Fire.startRound(rounds, deadline, paymentAmount)
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
							Fire.notify(this, ticketNumber)
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
					const increasedPayment = (paymentAmount / 100) * 125
					Fire.increasePrice(increasedPayment)
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
									const ticketNumber = generatedTickets[tPlayerCount]
									const verdict = winner(
										generatedTickets[winningIndex > 4 ? 0 : winningIndex],
										ticketNumber
									)
									const currentHolder = verdict == WON ? this : tCurrentOwner
									notify(ticketNumber)
									Fire.notify(this, ticketNumber)
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
				})
		const Jackpot = (amtCont / 100) * 50
		const Retained = (amtCont / 100) * 50
		if (balance() >= Jackpot) {
			transfer(Jackpot).to(currentOwner)
		}
		Fire.announce(
			currentOwner,
			generatedTickets[winningIndex > 4 ? 0 : winningIndex],
			balance() < target ? true : false,
			balance()
		)
		;[rounds, currentBal, totalGathered] = [
			rounds + 1,
			balance(),
			totalGathered + Retained,
		]
		continue
	}
	transfer(balance()).to(Deployer)
	commit()
	exit()
})
