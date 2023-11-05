import React from "react";
import { Landing } from "./pages/landing/Landing";
import Route from "./components/Route";

const App: React.FC = (): React.ReactElement => {
    return (
        <>
            <Route path="/">
                <Landing />
            </Route>
        </>
    );
};

export default App;
