import React, { useState } from 'react'
import Helmet from 'react-helmet'
import {
	loadStdlib,
	ALGO_WalletConnect as WalletConnect,
} from '@reach-sh/stdlib'
import * as backend from '../../build/index.main.mjs'
import { useClasses as fmtClasses } from '../hooks/useClasses'
import styles from '../styles/Global.module.css'
import { Preloader } from '../components/Preloader'
import { Alert } from '../components/Alert'
const reach = loadStdlib(process.env)

reach.setWalletFallback(
	reach.walletFallback({
		providerEnv: 'TestNet',
		WalletConnect,
	})
)

const { standardUnit } = reach
let someCtcInfo = null

export const ReachContext = React.createContext()

const ReachContextProvider = ({ children }) => {
	const [defaults] = useState({
		defaultPaymentAmount: 0.8,
		defaultDeadline: { ETH: 100, ALGO: 1000, CFX: 10000 }[reach.connector],
		standardUnit,
		connector: reach.connector,
	})
	const [views, setViews] = useState({
		view: 'ConnectAccount',
		wrapper: 'AppWrapper',
	})
	const [user, setUser] = useState({
		account: '',
		balance: '',
	})

	const [contract, setContract] = useState(null)

	const [isDeployer, setIsDeployer] = useState(false)
	const [deadline, setDeadline] = useState(defaults.defaultDeadline)
	const [amount, setAmount] = useState(defaults.defaultPaymentAmount)
	const [target, setTarget] = useState(0)
	const [terms, setTerms] = useState([deadline, amount])
	const [isConcluded, setIsConcluded] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [hasPurchased, setHasPurchased] = useState(false)

	const [resolveTerms, setResolveTerms] = useState({})
	const [round, setRound] = useState(1)

	const [attacherContract, setAttacherContract] = useState(null)
	const [resolveAcceptTerms, setResolveAcceptTerms] = useState({})
	const [participants, setParticipants] = useState([])
	const [winners, setWinners] = useState([])

	const [message, setMessage] = useState('')
	const [showAlert, setShowAlert] = useState(false)

	const [alertResolve, setAlertResolve] = useState({})

	const [canContinue, setCanContinue] = useState(false)
	const [balance, setBalance] = useState(0)
	const [contractEnd, setContractEnd] = useState(false)

	const [[waitingPromise, setContribPromise]] = [useState({})]

	const [[showPreloader, setShowPreloader], [processing, setProcessing]] = [
		useState(false),
		useState(false),
	]

	const reset = () => {
		setIsConcluded(false)
		setIsOpen(false)
		setHasPurchased(false)
		setRound(1)
		setParticipants([])
		setWinners([])
		setMessage('')
		setBalance(0)
		setContractEnd(false)
	}

	const sleep = (milSecs) =>
		new Promise((resolve) => setTimeout(resolve, milSecs))

	const alertThis = (message) => {
		const sleep = (milliseconds) =>
			new Promise((resolve) => {
				setAlertResolve((lastResolve) => ({ resolve }))
				return setTimeout(
					resolve,
					milliseconds / 1000 > 10 ? 10000 : milliseconds / 1000 < 3 ? 3000 : 0
				)
			})
		setMessage((lastMessage) => message)
		setShowAlert((lastState) => true)
		sleep(message.length * 300).then(() => {
			setShowAlert((lastState) => false)
		})
	}

	const hideAlert = () => {
		alertResolve.resolve()
	}

	// Async function
	const startWaiting = async () => {
		try {
			await new Promise((resolve, reject) => {
				waitingPromise['resolve'] = resolve
				waitingPromise['reject'] = reject
				setShowPreloader(true)
				setProcessing(true)
			})
			setShowPreloader(false)
		} catch {
			alertThis('Process failed!')
			setShowPreloader(false)
		}
	}

	// Non-async function
	// const startWaiting = () => {
	// 	return new Promise((resolve, reject) => {
	// 		waitingPromise['resolve'] = resolve
	// 		waitingPromise['reject'] = reject
	// 		setShowPreloader(true)
	// 		setProcessing(true)
	// 	})
	// 		.then(() => {
	// 			setShowPreloader(false)
	// 		})
	// 		.catch(() => {
	// 			alertThis('Process failed!')
	// 			setShowPreloader(false)
	// 		})
	// }

	const stopWaiting = (mode) => {
		if (mode) waitingPromise?.resolve && waitingPromise.resolve()
		else waitingPromise?.reject && waitingPromise.reject()
	}

	const sortArrayOfObjects = (arrayOfObjects, property) => {
		if (!arrayOfObjects) return arrayOfObjects
		if (!Array.isArray(arrayOfObjects)) return arrayOfObjects
		if (arrayOfObjects.length <= 1) return arrayOfObjects
		let isInt = false
		return arrayOfObjects
			.map((el, index) => {
				isInt = !isNaN(el?.[property])
				return !isInt
					? `${el?.[property]?.[0]
							?.toUpperCase()
							?.concat(el?.[property]?.slice(1))}^-.-^${index}`
					: `${el?.[property]}^-.-^${index}`
			})
			?.sort(
				isInt
					? (a, b) =>
							Number(a?.split('^-.-^')?.[0]) - Number(b?.split('^-.-^')?.[0])
					: undefined
			)
			?.map((el) => arrayOfObjects[el?.split('^-.-^')?.[1]])
	}

	const connectAccount = async () => {
		const account = await reach.getDefaultAccount()
		const balAtomic = await reach.balanceOf(account)
		const balance = reach.formatCurrency(balAtomic, 4)
		setUser({ account, balance })
		setViews({ view: 'DeployerOrAttacher', wrapper: 'AppWrapper' })
	}

	const selectAttacher = () => {
		setIsDeployer(false)
		setViews({ view: 'Attach', wrapper: 'AppWrapper' })
	}

	const setupContract = async () => {
		const terms = await new Promise((resolve) => {
			setViews({ view: 'SetTerms', wrapper: 'AppWrapper' })
			setResolveTerms({ resolve })
		})
		setTerms(terms)
		console.log(terms)
		startWaiting()
		return [
			terms[0],
			reach.parseCurrency(terms[1]),
			reach.parseCurrency(terms[2]),
		]
	}

	const finalizeTerms = (deadline, amount, target) => {
		resolveTerms.resolve([deadline, amount, target])
		setViews({ view: 'Deploying', wrapper: 'AppWrapper' })
	}

	const genTickets = (num) => {
		const tickets = []
		let counts = 0
		while (counts < num) {
			let ticket = Math.floor(Math.random() * 10000) + 10001
			while (tickets.includes(ticket))
				ticket = Math.floor(Math.random() * 10000) + 10001
			tickets.push(ticket)
			counts++
		}
		return tickets
	}

	const genWinningTicket = (tickets) => {
		return Math.floor(Math.random() * tickets.length)
	}

	const generate = (num) => {
		const generatedTickets = genTickets(num)

		const winningIndex = genWinningTicket(generatedTickets)

		return {
			generatedTickets,
			winningIndex,
		}
	}

	const DeployerInteract = {
		setupContract,
		generate,
	}

	const notify = ({ when, what }) => {
		const id = participants.length + 1
		const newParticipants = participants
		newParticipants.push({
			id,
			time: parseInt(when),
			address: what[0],
			ticket: parseInt(what[1]),
		})
		setParticipants([...newParticipants])
		stopWaiting(true)
	}

	const announce = async ({ when, what }) => {
		await sleep(5000)
		alertThis(
			`Congrats, user with ticket number ${what[1]}, you just won half the pot!`
		)

		if (what[2]) {
			await sleep(5000)
			alertThis(`The next round would begin shortly`)
		} else {
			await sleep(5000)
			alertThis(
				`The targeted amount has been raised, transferring contract balance of ${reach.formatCurrency(
					what[3],
					4
				)} ${standardUnit} to deployer and closing contract`
			)
			setContractEnd(true)
		}

		setIsConcluded(true)
		setCanContinue(what[2])
		const id = winners.length + 1
		const newWinners = winners
		newWinners.push({
			id,
			time: parseInt(when),
			address: what[0],
			ticket: parseInt(what[1]),
		})
		setWinners([...newWinners])
	}

	const log = async ({ when, what }) => {
		const paddedState = what[0]
		const ifState = (x) => x.padEnd(20, '\u0000')
		switch (paddedState) {
			case ifState('initiating'):
				alertThis(`Initiating contract operations!`)
				break
			case ifState('opened'):
				alertThis(
					`The normal draw window has opened! It will timeout in ${parseInt(
						what[1]
					)} blocks.`
                )
                setContract(someCtcInfo)
				setIsOpen(true)
				setHasPurchased(false)
				setViews({ view: 'Participants', wrapper: 'AppWrapper' })
				stopWaiting(true)
				break
			case ifState('closed'):
				startWaiting()
				alertThis(
					'The round has ended, spinning up a new window to start the next round.'
				)
				// TODO Show the closed view
				// alertThis(
				// 	`The normal draw window has opened! It will timeout in ${parseInt(
				// 		what[1]
				// 	)} blocks.`
				// )
				// setIsOpen(true)
				// setHasPurchased(false)
				break
			case ifState('timeout'):
				startWaiting()
				// TODO disable the purchasing button
				alertThis(
					`The normal draw window has timed out, yet tickets remain, increasing price by 25%!`
				)
				break
			default:
				break
		}
	}

	const updateRound = ({ when, what }) => {
		setRound(parseInt(what[0]))
	}

	const updateBalance = ({ when, what }) => {
		setBalance(reach.formatCurrency(what[0], 4))
		if (isConcluded && canContinue) {
			setHasPurchased(false)
			setIsConcluded(false)
			setIsOpen(true)
		}
	}

	const receivePrice = ({ when, what }) => {
		setAmount(reach.formatCurrency(what[0], 4))
        stopWaiting(true)
	}

	const assignMonitors = (events) => {
		events.log.monitor(log)
		events.logOpened.monitor(log)
		events.notify.monitor(notify)
		events.round.monitor(updateRound)
		events.balance.monitor(updateBalance)
		events.price.monitor(receivePrice)
		events.announce.monitor(announce)
	}

	const deploy = async () => {
		const ctc = user.account.contract(backend)
		setViews({ view: 'Deploying', wrapper: 'AppWrapper' })

		assignMonitors(ctc.events)

		ctc.p.Deployer(DeployerInteract)
		const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2)
		console.log(ctcInfoStr)
		setContract({ ctcInfoStr })
		reset()
		setViews({ ...views, view: 'Deployed' })
		stopWaiting(true)
	}

	const selectDeployer = async () => {
		setIsDeployer(true)
		await deploy()
	}

	const attach = async (ctcInfoStr) => {
		try {
			reset()
			startWaiting()

			const ctc = user.account.contract(backend, JSON.parse(ctcInfoStr))
			setAttacherContract(ctc)
			someCtcInfo = { ctcInfoStr }
			assignMonitors(ctc.events)
			alertThis(`Please wait for the Deployer to open the draw window.`)
		} catch (error) {
			console.log({ error })
			stopWaiting(false)
		}
	}

	const termsAccepted = () => {
		resolveAcceptTerms.resolveAcceptTerms(true)
	}

	const termsRejected = () => {
		resolveAcceptTerms.resolveAcceptTerms(false)
	}

	const buyTicket = async () => {
		startWaiting()
		setHasPurchased(true)
		try {
			alertThis(
				`You just pulled out ticket number ${await attacherContract.apis.Players.drawATicket()}`
			)
		} catch (error) {
			alertThis(
				`Sorry couldn't process purchase, possibly due to a timeout. Retry in a few seconds.`
			)
			setIsOpen(false)
			setHasPurchased(false)
			stopWaiting(false)
		}
	}

	const ReachContextValues = {
		...defaults,

		contract,
		deadline,
		amount,

		user,
		views,
		setViews,
		connectAccount,
		terms,
		setTerms,
		setAmount,
		setTarget,
		target,
		setDeadline,
		resolveTerms,
		isConcluded,
		isOpen,
		round,
		canContinue,

		showPreloader,
		setShowPreloader,
		processing,
		setProcessing,

		startWaiting,
		stopWaiting,

		sleep,

		message,
		setMessage,
		showAlert,
		hideAlert,
		alertThis,

		participants,
		isDeployer,
		hasPurchased,

		selectDeployer,
		selectAttacher,
		sortArrayOfObjects,
		winners,
		contractEnd,

		deploy,
		attach,
		termsAccepted,
		termsRejected,
		buyTicket,
		finalizeTerms,
		balance,
	}

	return (
		<ReachContext.Provider value={ReachContextValues}>
			<Helmet>
				<title>A Decentralized Lottery App</title>
			</Helmet>
			<Alert />
			{processing && <Preloader />}
			{children}
			{user.account && (
				<div className={fmtClasses(styles.last)}>
					<button
						className={fmtClasses(styles.back)}
						onClick={() => {
							setViews({ view: 'DeployerOrAttacher', wrapper: 'AppWrapper' })
						}}
					>
						Select Roles
					</button>
				</div>
			)}
		</ReachContext.Provider>
	)
}

export default ReachContextProvider
