import {useTranslate, BaseRecord} from "@refinedev/core";
import {
    Edit,
    useForm,
    SaveButton,
    DeleteButton,
} from "@refinedev/antd";
import {Form, Input, Select, InputNumber, Row, Col, Card} from "antd";
import {useParams} from "react-router-dom";

const {Option} = Select;

export const EditWithdrawalRequest = () => {
    const translate = useTranslate();
    const {id} = useParams<{id: string}>();
    
    const {formProps, saveButtonProps} = useForm<BaseRecord>({
        resource: "withdrawal-requests",
        action: "edit",
        id,
        redirect: "list"
    });


    return (
        <Edit
            headerButtons={[
                <SaveButton key="save" {...saveButtonProps} />,
                <DeleteButton key="delete" recordItemId={id} />
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
                                        min: 100,
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
                                    <Option value="orange">
                                        {translate("withdrawalRequests.operators.orange")}
                                    </Option>
                                    <Option value="mtn">
                                        {translate("withdrawalRequests.operators.mtn")}
                                    </Option>
                                    <Option value="wave">
                                        {translate("withdrawalRequests.operators.wave")}
                                    </Option>
                                     <Option value="moov">
                                        {translate("withdrawalRequests.operators.moov")}
                                    </Option>
                                    <Option value="ecobank">
                                        {translate("withdrawalRequests.operators.ecobank")}
                                    </Option>
                                    <Option value="cash">
                                        {translate("withdrawalRequests.operators.cash")}
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>
                    
                    <Col span={12}>
                        <Card title={translate("withdrawalRequests.sections.statusAndNotes")} size="small">
                            <Form.Item
                                label={translate("withdrawalRequests.fields.status")}
                                name="status"
                                rules={[
                                    {
                                        required: true,
                                        message: translate("withdrawalRequests.validation.status.required"),
                                    },
                                ]}
                            >
                                <Select
                                    placeholder={translate("withdrawalRequests.placeholders.status")}
                                    size="large"
                                >
                                     <Option value="PENDING">
                                        {translate("withdrawalRequests.status.pending")}
                                    </Option>
                                    <Option value="APPROVED">
                                        {translate("withdrawalRequests.status.approved")}
                                    </Option>
                                    <Option value="REJECTED">
                                        {translate("withdrawalRequests.status.rejected")}
                                    </Option>
                                    <Option value="FAILED">
                                        {translate("withdrawalRequests.status.failed")}
                                    </Option>
                                    <Option value="COMPLETED">
                                        {translate("withdrawalRequests.status.completed")}
                                    </Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label={translate("withdrawalRequests.fields.note")}
                                name="note"
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder={translate("withdrawalRequests.placeholders.note")}
                                />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};

export default EditWithdrawalRequest;