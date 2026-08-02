import React from "react";
import {Card, Form, Select, Space} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {enumToList} from "@/lib/ts-utilities";
import {yesNoOptions} from "@/core/domain/shared/form";
import {UserStatus, UserRole} from "@/lib/ts-utilities/enums/users-enum";

export const UsersEditActionFields: React.FC<{ translate: any }> = ({translate}) => {
    return (
        <Card
            style={{border: "1px solid #E8E9EE", borderRadius: 10}}
            title={
                <Space>
                    <EditOutlined/>
                    <p>{translate("Actions")}</p>
                </Space>
            }
            headStyle={{padding: "1rem"}}
            bodyStyle={{padding: "2rem"}}
        >
            <Form.Item
                label={translate("users.fields.role")}
                getValueProps={(value) => ({value: value?.id})}
                name={["role"]}
                rules={[{required: true}]}
            >
                <Select
                    style={{border: "1px solid #E8E9EE", borderRadius: 6}}
                    options={enumToList(UserRole).map((role) => ({
                        value: role,
                        label: <span>{translate(`users.tags.roles.${role}`)}</span>
                    }))}
                />
            </Form.Item>
            <Form.Item
                label={translate("users.fields.status")}
                name={["status"]}
                rules={[{required: true}]}
            >
                <Select
                    style={{border: "1px solid #E8E9EE", borderRadius: 6}}
                    options={enumToList(UserStatus).map((status) => ({
                        value: status,
                        label: <span>{translate(`users.tags.status.${status}`)}</span>
                    }))}
                />
            </Form.Item>
            <Form.Item
                label={translate("users.fields.compte_pro_valide")}
                name={["compteProValide"]}
                rules={[{required: true}]}
            >
                <Select
                    style={{border: "1px solid #E8E9EE", borderRadius: 6}}
                    options={yesNoOptions.map((option) => ({
                        value: option.value || false,
                        label: translate(option.label)
                    }))}
                />
            </Form.Item>
        </Card>
    );
};
