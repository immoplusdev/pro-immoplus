import React from "react";
import {DeleteButton, Edit, useForm, useSelect} from "@refinedev/antd";
import {Form, Row, Col, Space, Button} from "antd";
import { useTranslate } from "@refinedev/core";
import {ReservationEditDataFields} from "@/pages/reservations/components/edit-read-only-fields";
import {ReservationEditActionFields} from "@/pages/reservations/components/edit-actions-fields";
import {OrderedListOutlined, ReloadOutlined, SaveOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";


export const EditReservation: React.FC = () => {
    const translate = useTranslate();
    const navigate = useNavigate()
    const { formProps, saveButtonProps, queryResult, form } = useForm();
    const reservationData = queryResult?.data?.data;
    const { selectProps: residenceSelectProps } = useSelect({
        resource: "residences",
        filters: undefined,
    });

    return (
        <Edit
            saveButtonProps={saveButtonProps}
            footerButtons={() => (<></>)}
            headerButtons={
                <Space>
                    <Button
                        icon={<OrderedListOutlined/>}
                        onClick={() => navigate("/reservations")}
                    >
                        Reservations
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => form?.resetFields()}
                    >
                        Refresh
                    </Button>
                    <DeleteButton
                        recordItemId={reservationData?.id}
                        onSuccess={() =>navigate('/reservations')}
                    />
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        {...saveButtonProps}
                    >
                        Save
                    </Button>
                </Space>
            }
        >
            <Form {...formProps} layout="vertical">
                <Row gutter={[32, 32]} style={{marginTop: 32}}>
                    <Col xs={24} lg={16}>
                        <ReservationEditDataFields translate={translate} reservationData={reservationData}/>
                    </Col>
                    <Col xs={24} lg={8}>
                        <ReservationEditActionFields translate={translate}/>
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};
