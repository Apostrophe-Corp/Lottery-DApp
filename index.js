import * as AppViews from "./src/components/App";
import * as Attacher from "./src/components/Attacher";
import * as Deployer from "./src/components/Deployer";
import * as Player from "./src/components/Player";
import RenderViews, { renderDOM } from "./src/layouts/renderViews";
import ReachContextProvider from "./src/context/ReachContext";
// import styles from "./src/styles/Global.module.css";
import { useClasses } from "./src/hooks";

const Views = {
    ...AppViews,
    ...Attacher,
    ...Deployer,
    ...Player,
};

function App () {
    return (
        <div className={ useClasses() }>
            <RenderViews { ...Views } />
        </div>
    );
}

renderDOM(
    <ReachContextProvider>
        <App />
    </ReachContextProvider>
);

export default App;
