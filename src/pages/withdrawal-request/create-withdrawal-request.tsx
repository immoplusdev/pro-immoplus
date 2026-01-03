import {useTranslate} from "@refinedev/core";
import {
    Create,
    useForm,
    SaveButton,
} from "@refinedev/antd";
import {Form, Input, Select, InputNumber, Row, Col, Card} from "antd";
import {useNavigate} from "react-router-dom";

const {Option} = Select;

export const CreateWithdrawalRequest = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    
    const {formProps, saveButtonProps} = useForm({
        resource: "withdrawal-requests",
        action: "create",
        redirect: "list",
        onMutationSuccess: () => {
            navigate("/withdrawal-requests");
        }
    });

    return (
        <Create
            headerButtons={[
                <SaveButton {...saveButtonProps} />
            ]}
        >
            <Form {...formProps} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title={translate("withdrawalRequests.sections.requestDetails")} size="small">
                            <Form.Item
                                label={translate("withdrawalRequests.fields.amount")}
                                name="amount"
                                rules={[
                                    {
                                        required: true,
                                        message: translate("withdrawalRequests.validation.amount.required"),
                                    },
                                    {
                                        type: "number",
                                        min: 1,
                                        message: translate("withdrawalRequests.validation.amount.min"),
                                    },
                                ]}
                            >
                                <InputNumber
                                    placeholder={translate("withdrawalRequests.placeholders.amount")}
                                    style={{width: "100%"}}
                                    size="large"
                                    min={1}
                                    precision={2}
                                />
                            </Form.Item>

                            <Form.Item
                                label={translate("withdrawalRequests.fields.currency")}
                                name="currency"
                                initialValue="XOF"
                                rules={[
                                    {
                                        required: true,
                                        message: translate("withdrawalRequests.validation.currency.required"),
                                    },
                                ]}
                            >
                                <Select
                                    placeholder={translate("withdrawalRequests.placeholders.currency")}
                                    size="large"
                                >
                                    <Option value="XOF">XOF (Franc CFA)</Option>
                                    <Option value="EUR">EUR (Euro)</Option>
                                    <Option value="USD">USD (Dollar)</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label={translate("withdrawalRequests.fields.phoneNumber")}
                                name="phoneNumber"
                                rules={[
                                    {
                                        required: true,
                                        message: translate("withdrawalRequests.validation.phoneNumber.required"),
                                    },
                                    {
                                        pattern: /^[0-9+\-\s()]+$/,
                                        message: translate("withdrawalRequests.validation.phoneNumber.pattern"),
                                    },
                                ]}
                            >
                                <Input
                                    placeholder={translate("withdrawalRequests.placeholders.phoneNumber")}
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label={translate("withdrawalRequests.fields.operator")}
                                name="operator"
                                rules={[
                                    {
                                        required: true,
                                        message: translate("withdrawalRequests.validation.operator.required"),
                                    },
                                ]}
                            >
                                <Select
                                    placeholder={translate("withdrawalRequests.placeholders.operator")}
                                    size="large"
                                >
                                    <Option value="ORANGE_MONEY">
                                        {translate("withdrawalRequests.operators.ORANGE_MONEY")}
                                    </Option>
                                    <Option value="MTN_MONEY">
                                        {translate("withdrawalRequests.operators.MTN_MONEY")}
                                    </Option>
                                    <Option value="MOOV_MONEY">
                                        {translate("withdrawalRequests.operators.MOOV_MONEY")}
                                    </Option>
                                    <Option value="WAVE">
                                        {translate("withdrawalRequests.operators.WAVE")}
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>
                    
                    <Col span={12}>
                        <Card title={translate("withdrawalRequests.sections.additionalInfo")} size="small">
                            <Form.Item
                                label={translate("withdrawalRequests.fields.note")}
                                name="note"
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder={translate("withdrawalRequests.placeholders.note")}
                                />
                            </Form.Item>

                            <Form.Item
                                label={translate("withdrawalRequests.fields.status")}
                                name="status"
                                initialValue="PENDING"
                            >
                                <Select
                                    placeholder={translate("withdrawalRequests.placeholders.status")}
                                    size="large"
                                    disabled
                                >
                                    <Option value="PENDING">
                                        {translate("withdrawalRequests.status.pending")}
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Create>
    );
};

export default CreateWithdrawalRequest;