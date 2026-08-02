import React from "react";
import {BaseRecord, useTranslate} from "@refinedev/core";
import {Card, Space} from "antd";
import {DatabaseOutlined} from "@ant-design/icons";
import {ReadOnlyFormField} from "@/lib/ts-utilities";


export const ConfigDataFields: React.FC<{ data?: BaseRecord }> = ({data}) => {
    const translate = useTranslate();
    return (
        <Card
            style={{border: "1px solid #E8E9EE", borderRadius: 10}}
            title={
                <Space>
                    <DatabaseOutlined/>
                    <p>{translate("biens_immobiliers.fields.data")}</p>
                </Space>
            }
            headStyle={{padding: "1rem"}}
            bodyStyle={{padding: "2rem", display: "flex", flexDirection: "row"}}
        >
            <Card style={{border: "none", width: "50%"}}>
                <ReadOnlyFormField label={translate("configs.fields.project_name")} content={data?.projectName}/>
                {/*<ReadOnlyFormField label={translate("configs.fields.contact_phone_number")}*/}
                {/*                   content={data?.contactPhoneNumber}/>*/}
                {/*<ReadOnlyFormField label={translate("configs.fields.contact_email")} content={data?.contactEmail}/>*/}

            </Card>
            <Card style={{width: "50%", border: "none"}}>
                <ReadOnlyFormField label={translate("configs.fields.sms_sender_name")} content={data?.sms_sender_name}/>
            </Card>
        </Card>
    );
};
