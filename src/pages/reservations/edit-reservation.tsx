import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Row, Col } from "antd";
import { useTranslate } from "@refinedev/core";
import {ReservationEditDataFields} from "@/pages/reservations/components/edit-read-only-fields";
import {ReservationEditActionFields} from "@/pages/reservations/components/edit-actions-fields";


export const EditReservation: React.FC = () => {
    const translate = useTranslate();
    const { formProps, saveButtonProps, queryResult } = useForm();
    const reservationData = queryResult?.data?.data;
    const { selectProps: residenceSelectProps } = useSelect({
        resource: "residences",
        filters: undefined,
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
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
