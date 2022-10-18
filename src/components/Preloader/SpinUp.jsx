import React, { useState, useEffect } from 'react'
import { useReach, fmtClasses } from '../../hooks'
import styles from '../../styles/Preloader.module.css'

const SpinUp = () => {
	const { sleep, showSpinUp, setShowSpinUp, setAwaiting } = useReach()
	const [preloaderClass, setPreloaderClass] = useState(
		fmtClasses(styles.container, styles.invisible)
	)

	const [spinUpClass, setSpinUpClass] = useState(fmtClasses(styles.roulette))

	useEffect(() => {
		setPreloaderClass(styles.container)
	}, [])

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		const close = async () => {
			const fadeOff = async () => {
				setPreloaderClass(fmtClasses(styles.container, styles.invisible))
				await sleep(400)
				setPreloaderClass(
					fmtClasses(styles.container, styles.invisible, styles.terminated)
				)
			}
			if (showSpinUp === false) {
				setSpinUpClass(fmtClasses(styles.stop))
				await fadeOff()
				setAwaiting(false)
			}
		}
		close()
	}, [setAwaiting, showSpinUp, sleep])

	return (
		<div className={preloaderClass}>
			<div
				className={fmtClasses(styles.closeBtn)}
				onClick={() => {
					setShowSpinUp(false)
				}}
			>
				Close
			</div>
			<div className={spinUpClass}></div>
		</div>
	)
}

export default SpinUp
