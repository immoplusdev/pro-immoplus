import React from "react";
import {BaseRecord} from "@refinedev/core";
import {Card, Space} from "antd";
import {DatabaseOutlined} from "@ant-design/icons";
import {ReadOnlyFormField} from "@/lib/ts-utilities";


export const UsersEditDataFields: React.FC<{ translate: any; data?: BaseRecord }> = ({ translate, data }) => {
    return (
        <Card
            title={
                <Space>
                    <DatabaseOutlined />
                    <p>{translate("users.fields.data")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem", border:"0.5px solid black" }}
            bodyStyle={{ padding: "2rem", border:"0.5px solid black", display:"flex", flexDirection:"row"}}
        >
            <Card style={{ border: "none", width: "50%" }}>
                <ReadOnlyFormField label={translate("users.fields.lastname")} content={data?.lastName} />
                <ReadOnlyFormField label={translate("users.fields.firstname")} content={data?.firstName} />
                <ReadOnlyFormField label={translate("users.fields.email")} content={data?.email} />
                <ReadOnlyFormField label={translate("users.fields.phone_number")} content={data?.phoneNumber} />
                <ReadOnlyFormField label={translate("fields.created_at")} content={new Date(data?.createdAt).toLocaleDateString()} />
                <ReadOnlyFormField label={translate("fields.updated_at")} content={new Date(data?.updatedAt).toLocaleDateString()} />
            </Card>
            <Card style={{ width: "50%", border: "none" }}>
                <ReadOnlyFormField label={translate("users.fields.role")} content={data?.role?.id} />
                <ReadOnlyFormField label={translate("users.fields.identity_verified")} content={data?.identityVerified ? "Yes" : "No"} />
                <ReadOnlyFormField label={translate("users.fields.email_verified")} content={data?.emailVerified ? "Yes" : "No"} />
                <ReadOnlyFormField label={translate("users.fields.phone_number_verified")} content={data?.phoneNumberVerified ? "Yes" : "No"} />
                <ReadOnlyFormField label={translate("users.fields.compte_pro_valide")} content={data?.compteProValide ? "Yes" : "No"} />
                <ReadOnlyFormField label={translate("users.fields.auth_login_attempts")} content={data?.authLoginAttempts} />
            </Card>
        </Card>
    );
};