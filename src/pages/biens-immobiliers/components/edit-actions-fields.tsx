import React from "react";
import {Card, Form, InputNumber, Select, Space} from "antd";
import {enumToList} from "@/lib/ts-utilities";
import {EditOutlined, UserOutlined} from "@ant-design/icons";
import {yesNoOptions} from "@/core/domain/shared/form";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";
import {ShowUserButton} from "@/pages/users/components";

interface Props {
    translate: any;
    ownerId?: string;
}

export const BienImmobilierEditActionFields: React.FC<Props> = ({ translate, ownerId }) => {

    return (
        <>
            <Card
                style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
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
                    label={translate("biens_immobiliers.fields.bien_immobilier_disponible")}
                    style={{ width: "17vw" }}
                    name={["bienImmobilierDisponible"]}
                    rules={[{ required: true }]}
                >
                    <Select
                        style={{border: "1px solid #E8E9EE", borderRadius: 6}}
                        options={yesNoOptions.map(option=>({
                            label: translate(option.label),
                            value: option.value || false
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    label={translate("fields.status_validation")}
                    style={{ width: "17vw" }}
                    name={["statusValidation"]}
                    rules={[{ required: true }]}
                >
                    <Select
                        style={{border: "1px solid #E8E9EE", borderRadius: 6}}
                        options={enumToList(StatusValidationBiensImmobilers).map((item) => ({
                            value: item,
                            label: <span>{translate(`biens_immobiliers.fields.${item}`)}</span>,
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    label={translate("Score")}
                    style={{ width: "17vw" }}
                    name={["score"]}
                >
                    <InputNumber
                        min={0}
                        style={{width: "100%", border: "1px solid #E8E9EE", borderRadius: 6}}
                    />
                </Form.Item>
            </Card>

            <Card
                style={{ marginTop: 16, border: "1px solid #E8E9EE", borderRadius: 10 }}
                title={
                    <Space>
                        <UserOutlined />
                        <p>{translate("Propriétaire")}</p>
                    </Space>
                }
                headStyle={{ padding: "1rem" }}
                bodyStyle={{ padding: "2rem" }}
            >
                {ownerId ? (
                    <ShowUserButton id={ownerId} title={translate("users.common.see_owner")} />
                ) : (
                    <p>{translate("Aucun propriétaire associé")}</p>
                )}
            </Card>
        </>
    );
};
