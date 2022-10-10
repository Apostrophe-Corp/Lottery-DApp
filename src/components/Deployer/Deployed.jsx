import React from "react";
import { useReach, useClasses } from "../../hooks";
import styles from "../../styles/Global.module.css";

const sleep = async (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

const Deployed = () => {
    const { contract,setViews } = useReach();

    const copyToClipboard = async (button) => {
        navigator.clipboard.writeText(contract.ctcInfoStr);
        const origInnerHTML = button.innerHTML;
        button.innerHTML = "Copied!";
        button.disabled = true;
        await sleep(1000);
        button.innerHTML = origInnerHTML;
        button.disabled = false;
    };

    return (
        <div className={ useClasses(styles.subContainer) }>
            <h2 className={ useClasses() }> Waiting for Attacher to join...</h2>
            <h3 className={ useClasses() }> Please give them this contract info:</h3>
            <pre className={ useClasses(styles.fields) }>{ contract.ctcInfoStr }</pre>
            <button className={ useClasses(styles.actionButton) } onClick={ (e) => copyToClipboard(e.currentTarget.value) }>
                Copy to clipboard
            </button>
            <button className={ useClasses(styles.actionButton) } onClick={ () => setViews({view: 'Participants', wrapper: 'AppWrapper'}) }>
                Continue to Raffle View
            </button>
        </div>
    );
};

export default Deployed;