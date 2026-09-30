import React from "react";
import {DeleteButton, Edit, useForm, useSelect} from "@refinedev/antd";
import {Form, Row, Col, Space, Button} from "antd";
import { useTranslate } from "@refinedev/core";
import {ReservationEditDataFields} from "@/pages/reservations/components/edit-read-only-fields";
import {ReservationEditActionFields} from "@/pages/reservations/components/edit-actions-fields";
import {OrderedListOutlined, ReloadOutlined, SaveOutlined} from "@ant-design/icons";
import {useNavigate, useLocation, useParams} from "react-router-dom";
import {ReservationRemindersCard} from "@/components/admin/reservation-reminders/ReservationRemindersCard";
import {isAdminViewer} from "@/components/auth/is-admin-viewer";


export const EditReservation: React.FC = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const location = useLocation();
    const goBack = () => navigate((location.state as any)?.from || -1);
    const {id: reservationId} = useParams<{ id: string }>();
    const { formProps, saveButtonProps, queryResult, form } = useForm({
        redirect: false,
        onMutationSuccess: goBack,
    });
    const reservationData = queryResult?.data?.data;
    const { selectProps: residenceSelectProps } = useSelect({
        resource: "residences",
        filters: undefined,
    });

    return (
        <Edit
            title={`${translate(`actions.edit`)} Reservation`}
            breadcrumb={null}
            saveButtonProps={saveButtonProps}
            footerButtons={() => (<></>)}
            headerButtons={
                <Space>
                    <Button
                        icon={<OrderedListOutlined/>}
                        onClick={goBack}
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
                        onSuccess={goBack}
                    />
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        {...saveButtonProps}
                    >
                        {translate('buttons.save')}
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
                        <ReservationEditActionFields translate={translate} reservationData={reservationData}/>
                    </Col>
                </Row>
            </Form>
            {/* Historique des relances : GET /reservations/:id/relances n'est ouvert qu'au rôle Admin côté staff. */}
            {isAdminViewer() && (
                <Row gutter={[32, 32]} style={{marginTop: 32}}>
                    <Col xs={24} lg={16}>
                        <ReservationRemindersCard reservationId={reservationId}/>
                    </Col>
                </Row>
            )}
        </Edit>
    );
};
