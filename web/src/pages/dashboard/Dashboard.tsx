import React, { FC } from "react";
import { Card } from "antd";
import { useTranslation } from "react-i18next";

const Dashboard: FC = () => {
    const {t} = useTranslation();

    return (
        <Card>
            <h1>{t("welcome")}</h1>
        </Card>
    );
};

export default Dashboard;
