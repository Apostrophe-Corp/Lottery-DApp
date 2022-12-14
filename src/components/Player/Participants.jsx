import React, { useState, useEffect } from 'react'
import { useClasses, useReach, fmtClasses } from '../../hooks'
import styles from '../../styles/Proposals.module.css'

const Participants = () => {
	const {
		participants,
		buyTicket,
		isDeployer,
		isOpen,
		amount,
		standardUnit,
		hasPurchased,
		round,
		balance,
		target,
		winners,
		contractEnd,
		hasIncreased,
		sleep,
	} = useReach()

	const [[bConClass, setBConClass], [bClass, setBClass]] = [
		useState(fmtClasses(styles.bContainer)),
		useState(fmtClasses(isOpen ? styles.button : styles.disabled)),
	]

	useEffect(() => {
		const doSomething = async () => {
			setBClass((previous) => fmtClasses(styles.button, styles.zOut))
			await sleep(1500)
			setBConClass((previous) => fmtClasses(styles.increased))
			await sleep(1000)
			setBClass((previous) => fmtClasses(styles.button))
		}
		const doSomeOtherThing = async () => {
			setBClass((previous) => fmtClasses(styles.button, styles.zOut))
			await sleep(1500)
			setBConClass((previous) => fmtClasses(styles.bContainer))
			await sleep(1000)
			setBClass((previous) => fmtClasses(styles.button))
		}
		if (hasIncreased) {
			doSomething()
		} else {
			doSomeOtherThing()
		}
	}, [hasIncreased])

	return (
		<div className={useClasses(styles.container)}>
			<h1 className={useClasses(styles.title)}>
				{contractEnd ? `Contract Closed` : `Participants (Round ${round})`}
			</h1>
			{!contractEnd && (
				<div className={fmtClasses(styles.proposals)}>
					<div className={fmtClasses(styles.proposal)}>
						<div className={fmtClasses(styles.identifiers)}>
							<span className={fmtClasses(styles.time)}>Consensus Time</span>
							<span className={fmtClasses(styles.address)}>Address</span>
						</div>
						<span className={fmtClasses(styles.ticket)}>Ticket Number</span>
					</div>
					{participants
						.filter((el) => el.id > (round - 1) * 5 && el.id <= round * 5)
						.map((el, index) => {
							return (
								<div
									key={index}
									className={fmtClasses(styles.proposal)}
								>
									<div className={fmtClasses(styles.identifiers)}>
										<span className={fmtClasses(styles.time)}>{el.time}</span>
										<span className={fmtClasses(styles.address)}>
											{el.address}
										</span>
									</div>
									<span className={fmtClasses(styles.ticket)}>{el.ticket}</span>
								</div>
							)
						})}
				</div>
			)}
			{!contractEnd && (
				<>
					{!hasPurchased && (
						<>
							{!isDeployer && (
								<div className={fmtClasses(styles.buttonBox)}>
									{!isOpen && (
										<span className={fmtClasses(styles.littleText)}>
											The window has been closed temporarily.
										</span>
									)}
									<div className={fmtClasses(styles.view)}>
										<div className={bConClass}>
											<div className={fmtClasses(styles.iBContainer)}>
												<button
													className={bClass}
													onClick={buyTicket}
													disabled={!(isOpen && !hasIncreased)}
												>
													{isOpen && !hasIncreased
														? `Buy Ticket at ${amount} ${standardUnit}`
														: 'Please wait...'}
												</button>
											</div>
											<div className={fmtClasses(styles.iBContainer)}>
												<button
													className={fmtClasses(bClass, styles.higher)}
													onClick={buyTicket}
													disabled={!isOpen}
												>
													{isOpen
														? `Buy Ticket at ${amount} ${standardUnit}`
														: 'Please wait...'}
												</button>
											</div>
										</div>
									</div>
								</div>
							)}
						</>
					)}
				</>
			)}
			{isDeployer && (
				<div className={fmtClasses(styles.buttonBox)}>
					<span className={fmtClasses(styles.littleText)}>
						Balance: {balance}
					</span>
					<span className={fmtClasses(styles.littleText)}>
						Target: {target}
					</span>
				</div>
			)}
			<h1 className={useClasses(styles.title)}>Winners</h1>
			<div className={useClasses(styles.proposals)}>
				<div className={useClasses(styles.proposal)}>
					<div className={useClasses(styles.identifiers)}>
						<span className={useClasses(styles.time)}>Consensus Time</span>
						<span className={useClasses(styles.address)}>Address</span>
					</div>
					<span className={useClasses(styles.ticket)}>Ticket Number</span>
				</div>
				{winners.map((el, index) => {
					return (
						<div
							key={index}
							className={fmtClasses(styles.proposal, styles.winner)}
						>
							<div className={fmtClasses(styles.identifiers)}>
								<span className={fmtClasses(styles.time)}>{el.time}</span>
								<span className={fmtClasses(styles.address)}>{el.address}</span>
							</div>
							<span className={fmtClasses(styles.ticket)}>{el.ticket}</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default Participants
