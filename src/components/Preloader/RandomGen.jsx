import React, { useState, useEffect } from 'react'
import { useReach, fmtClasses } from '../../hooks'
import styles from '../../styles/Preloader.module.css'

const RandomGen = () => {
	const { sleep, showRandomGen, setShowRandomGen, setLoading } = useReach()
	const [preloaderClass, setPreloaderClass] = useState(
		fmtClasses(styles.container, styles.invisible)
	)

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
			if (showRandomGen === false) {
				await fadeOff()
				setLoading(false)
			}
		}
		close()
	}, [setLoading, showRandomGen, sleep])

	return (
		<div className={preloaderClass}>
			<div
				className={fmtClasses(styles.closeBtn)}
				onClick={() => {
					setShowRandomGen(false)
				}}
			>
				Close
			</div>
			<div className={fmtClasses(styles.roulette)}></div>
		</div>
	)
}

export default RandomGen
