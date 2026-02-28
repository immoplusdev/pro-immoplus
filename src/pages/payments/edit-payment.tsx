import React from "react";
import {useTranslate} from "@refinedev/core";
import {Edit, useForm} from "@refinedev/antd";
import {Button, Card, Col, Form, Row, Select, Space, Tag} from "antd";
import {useNavigate} from "react-router-dom";
import {DatabaseOutlined, EditOutlined, OrderedListOutlined, ReloadOutlined, SaveOutlined} from "@ant-design/icons";
import {enumToList, ReadOnlyFormField} from "@/lib/ts-utilities";
import {Payment, PaymentStatus} from "@/core/domain/payments";
import {Amount} from "@/components/payments";
export function EditPayment() {
    const translate = useTranslate();
    const navigate = useNavigate()
    const {formProps, saveButtonProps, queryResult, form} = useForm();
    const data = queryResult?.data?.data as Payment;
    console.log(queryResult)
    return (
        <Edit
            title={`${translate(`actions.edit`)} Paiements`}
            saveButtonProps={saveButtonProps}
            headerButtons={
                <Space>
                    <Button icon={<OrderedListOutlined/>} onClick={() => navigate("/payments")}>Paiements</Button>
                    <Button
                        icon={<ReloadOutlined/>}
                        onClick={() => form?.resetFields()}
                    >
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined/>}
                        {...saveButtonProps}
                    >
                        {translate("buttons.save")}
                    </Button>
                </Space>
            }
        >
            <Form {...formProps} layout="vertical">
                <Row gutter={[32, 32]} style={{marginTop: 32}}>
                    <Col xs={24} md={24} lg={16}>
                        <Card
                            title={
                                <Space>
                                    <DatabaseOutlined/>
                                    <p>{translate("pages.payment.title")}</p>
                                </Space>
                            }
                            headStyle={{padding: "1rem", border: "0.5px solid black"}}
                            bodyStyle={{
                                padding: "2rem",
                                border: "0.5px solid black",
                                display: "flex",
                                flexDirection: "row"
                            }}
                        >
                            <Card style={{border: "none", width: "50%", display: "flex", flexDirection: "row"}}>
                                <ReadOnlyFormField
                                    label={translate("pages.payment.fields.amount")}
                                    content={data?.amount}
                                />
                                <ReadOnlyFormField
                                    label={translate("pages.payment.fields.payment_type")}
                                    content={<Tag>{data?.paymentType}</Tag>}
                                />
                                <ReadOnlyFormField
                                    label={translate("pages.payment.fields.payment_method")}
                                    content={<Tag>{data?.paymentMethod}</Tag>}
                                />
                            </Card>
                            <Card style={{border: "none", width: "50%"}}>
                                <ReadOnlyFormField
                                    label={translate("pages.payment.fields.amount_with_fees")}
                                    content={data?.amountNoFees}
                                />
                                <ReadOnlyFormField
                                    label={translate("pages.payment.fields.collection")}
                                    content={<Tag>{data?.collection}</Tag>}
                                />
                                <ReadOnlyFormField
                                    label={translate("pages.payment.fields.payment_status")}
                                    content={<Tag>{data?.paymentStatus}</Tag>}
                                />
                            </Card>
                        </Card>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Card
                            title={
                                <Space>
                                    <EditOutlined/>
                                    <p>{translate("pages.payment.fields.actions")}</p>
                                </Space>
                            }
                            headStyle={{padding: "1rem", border: "0.5px solid black"}}
                            bodyStyle={{
                                padding: "2rem",
                                border: "0.5px solid black",
                                display: "flex",
                                flexDirection: "column"
                            }}
                        >
                            <Form.Item
                                label={translate("pages.payment.fields.payment_status")}
                                name={["paymentStatus"]}
                                rules={[{required: true}]}
                            >
                                <Select
                                    style={{border: "0.5px solid black", borderRadius: "7px"}}
                                    options={enumToList(PaymentStatus).map(item => ({
                                        value: item,
                                        label: <span>{translate(`pages.payment.tags.${item}`)}</span>
                                    }))}/>
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
}

