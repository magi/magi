import { FC, useEffect, useState } from "react";
import "./App.less";
import Routers from "./routers/Routers";
import { ConfigProvider } from "antd";
import { getLocal } from "./utils/local";

const App: FC = () => {
    const [local, setLocal] = useState(getLocal());

    useEffect(() => {
        setLocal(getLocal());
    }, [getLocal()]);

    return (
        <ConfigProvider locale={local}>
            <div className='App'>
                <Routers />
            </div>
        </ConfigProvider>
    );

};

export default App;
