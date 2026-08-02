import React from "react";
import {useTranslate} from "@refinedev/core";
import {Edit, useForm} from "@refinedev/antd";
import {Button, Card, Col, Form, Row, Select, Space} from "antd";
import {useNavigate, useLocation} from "react-router-dom";
import {DatabaseOutlined, EditOutlined, OrderedListOutlined, ReloadOutlined, SaveOutlined} from "@ant-design/icons";
import {enumToList, ReadOnlyFormField} from "@/lib/ts-utilities";
import {Payment, PaymentStatus} from "@/core/domain/payments";
import {Amount} from "@/components/payments";
import {OutlineTag} from "@/components/table";
export function EditPayment() {
    const translate = useTranslate();
    const navigate = useNavigate();
    const location = useLocation();
    const goBack = () => navigate((location.state as any)?.from || -1);
    const {formProps, saveButtonProps, queryResult, form} = useForm({
        redirect: false,
        onMutationSuccess: goBack,
    });
    const data = queryResult?.data?.data as Payment;
    console.log(queryResult)
    return (
        <Edit
            title={`${translate(`actions.edit`)} Paiements`}
            saveButtonProps={saveButtonProps}
            headerButtons={
                <Space>
                    <Button icon={<OrderedListOutlined/>} onClick={goBack}>Paiements</Button>
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
                            style={{border: "1px solid #E8E9EE", borderRadius: 10}}
                            title={
                                <Space>
                                    <DatabaseOutlined/>
                                    <p>{translate("pages.payment.title")}</p>
                                </Space>
                            }
                            headStyle={{padding: "1rem"}}
                            bodyStyle={{
                                padding: "2rem",
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
                                    content={<OutlineTag color="#5F5E5A">{data?.paymentType}</OutlineTag>}
                                />
                                <ReadOnlyFormField
                                    label={translate("pages.payment.fields.payment_method")}
                                    content={<OutlineTag color="#5F5E5A">{data?.paymentMethod}</OutlineTag>}
                                />
                            </Card>
                            <Card style={{border: "none", width: "50%"}}>
                                <ReadOnlyFormField
                                    label={translate("pages.payment.fields.amount_with_fees")}
                                    content={data?.amountNoFees}
                                />
                                <ReadOnlyFormField
                                    label={translate("pages.payment.fields.collection")}
                                    content={<OutlineTag color="#5F5E5A">{data?.collection}</OutlineTag>}
                                />
                                <ReadOnlyFormField
                                    label={translate("pages.payment.fields.payment_status")}
                                    content={<OutlineTag color="#5F5E5A">{data?.paymentStatus}</OutlineTag>}
                                />
                            </Card>
                        </Card>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Card
                            style={{border: "1px solid #E8E9EE", borderRadius: 10}}
                            title={
                                <Space>
                                    <EditOutlined/>
                                    <p>{translate("pages.payment.fields.actions")}</p>
                                </Space>
                            }
                            headStyle={{padding: "1rem"}}
                            bodyStyle={{
                                padding: "2rem",
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
                                    style={{border: "1px solid #E8E9EE", borderRadius: 6}}
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

