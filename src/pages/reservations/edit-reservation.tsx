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
import {ReservationRelocationButton} from "@/components/admin/reservation-relocation/ReservationRelocationButton";
import {ResidenceChangeHistoryCard} from "@/components/admin/reservation-relocation/ResidenceChangeHistoryCard";
import {ReservationAdminCreationCard} from "@/components/admin/reservation-creation/ReservationAdminCreationCard";


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
    const isAdmin = isAdminViewer();
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
                    {/* Changement de résidence : rôle Admin uniquement (Financier / Commercial reçoivent 403). */}
                    <ReservationRelocationButton
                        reservation={reservationData}
                        isAdmin={isAdmin}
                        onReload={() => queryResult?.refetch()}
                    />
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
            {isAdmin && (
                <Row gutter={[32, 32]} style={{marginTop: 32}}>
                    <Col xs={24} lg={16}>
                        <Space direction="vertical" size="large" style={{width: "100%"}}>
                            {/* Encart « Créée depuis le backoffice » : rien si la réservation vient de l'app (404). */}
                            <ReservationAdminCreationCard reservationId={reservationId}/>
                            {/* Historique des changements de résidence : masqué si vide ou refusé (403). */}
                            <ResidenceChangeHistoryCard reservationId={reservationId}/>
                            <ReservationRemindersCard reservationId={reservationId}/>
                        </Space>
                    </Col>
                </Row>
            )}
        </Edit>
    );
};
