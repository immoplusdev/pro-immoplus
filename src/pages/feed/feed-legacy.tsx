import { useTranslate } from "@refinedev/core";
import { List } from "@refinedev/antd";
import { Empty, Button } from "antd";
import { Link } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";

export const FeedLegacy = () => {
    const translate = useTranslate();

    return (
        <List
            title={translate("feed.sections.legacyFlow")}
            headerButtons={[
                <Link key="home" to="/feed">
                    <Button icon={<HomeOutlined />}>
                        {translate("feed.actions.backToHome")}
                    </Button>
                </Link>,
            ]}
        >
            <Empty
                description={translate("common.notAvailable")}
                style={{ marginTop: 40 }}
            />
        </List>
    );
};
