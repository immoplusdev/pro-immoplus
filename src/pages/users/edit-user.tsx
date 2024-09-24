import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import {Card, Col, Form, Row, Space, Input, Checkbox, DatePicker, Select} from "antd";
import { useTranslate } from "@refinedev/core";
import { BaseRecord } from "@refinedev/core";
import dayjs from "dayjs";
import {enumToList, ReadOnlyFormField} from "@/lib/ts-utilities"; // Assuming you have a utility for read-only fields
import { DatabaseOutlined, EditOutlined } from "@ant-design/icons";
import {StatusReservation, StatusUser} from "@/lib/ts-utilities/enums/status-reservation";
import {statusValidationResidence} from "@/core/domain/residences";

// Main EditUser Component
export const EditUser: React.FC = () => {
    const translate = useTranslate();
    const { formProps, saveButtonProps, queryResult } = useForm();
    const usersData = queryResult?.data?.data;

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
                    <Col xs={24} md={24} lg={16}>
                        <UserDataField translate={translate} data={usersData} />
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <UserActionsField translate={translate} />
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};

// UserDataField Component for Read-Only Data
const UserDataField: React.FC<{ translate: any; data?: BaseRecord }> = ({ translate, data }) => {
    return (
        <Card
            title={
                <Space>
                    <DatabaseOutlined />
                    <p>{translate("users.fields.data")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem",}}
            bodyStyle={{ padding: "2rem", display: "flex", flexDirection: "row" }}
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

// UserActionsField Component for Editable Fields
const UserActionsField: React.FC<{ translate: any }> = ({ translate }) => {
    return (
        <Card
            title={
                <Space>
                    <EditOutlined />
                    <p>{translate("Actions")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem" }}
            bodyStyle={{ padding: "2rem" }}
        >
            <Form.Item
                label={translate("users.fields.status")}
                name={["status"]}
                rules={[{ required: true }]}
            >
               <Select
                    options={enumToList(StatusUser).map((item) =>({
                        value: item,
                        label:  <span>{translate(`users.status_reservation.${item}`)}</span>
                    }))}
               />
            </Form.Item>
            <Form.Item
                label={translate("users.fields.compte_pro_valide")}
                name={["compteProValide"]}
                rules={[{ required: true }]}
            >
               <Select
                    options={enumToList(StatusUser).map((item) =>({
                        value: item,
                        label:  <span>{translate(`user.status_reservation.${item}`)}</span>
                    }))}
               />
            </Form.Item>
        </Card>
    );
};
