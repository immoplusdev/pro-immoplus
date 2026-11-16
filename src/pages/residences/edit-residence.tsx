import React, {useEffect, useMemo, useRef, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {OrderedListOutlined, ReloadOutlined, SaveOutlined} from "@ant-design/icons"
import {DeleteButton, Edit, useForm} from "@refinedev/antd";
import {ResidenceEditActionFields} from "@/pages/residences/components/edit-actions-fields";
import {ResidenceDataFields} from "@/pages/residences/components/edit-read-only-fields";
import {SeedResidenceRating} from "@/pages/residences/components/seed-residence-rating";
import {useTranslate} from "@refinedev/core";
import {Button, Col, Form, Row, Space} from "antd";
import {extractRelationId} from "@/lib/helpers";
import {StayResidenceSection} from "@/pages/residences/stay/stay-residence-section";
import {
    buildResidencePatch,
    isStayResidence,
    mapStayApiErrors,
    toStayFormValues,
} from "@/pages/residences/stay/stay-residence.helpers";




export const EditResidence: React.FC = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const location = useLocation();
    const goBack = () => navigate((location.state as any)?.from || -1);
    const [stayGeneralErrors, setStayGeneralErrors] = useState<string[]>([]);
    // Lu dans les callbacks de mutation, qui peuvent capturer un rendu antérieur.
    const isStayRef = useRef(false);

    const { formProps, saveButtonProps, queryResult, form } = useForm({
        redirect: false,
        // Résidence séjour : on reste sur la fiche, rechargée avec la réponse du PATCH.
        onMutationSuccess: () => {
            setStayGeneralErrors([]);
            if (!isStayRef.current) goBack();
        },
        onMutationError: (error) => {
            if (!isStayRef.current) return;
            const {fields, general} = mapStayApiErrors(error);
            if (fields.length) form?.setFields(fields);
            setStayGeneralErrors(general);
        },
    });
    const residencesData = queryResult?.data?.data;
    const isStay = isStayResidence(residencesData);
    isStayRef.current = isStay;

    // Les champs séjour vivent sous `stay`, avec les noms d'écriture du PATCH.
    const stayInitialValues = useMemo(
        () => (isStay ? toStayFormValues(residencesData) : undefined),
        [isStay, residencesData],
    );
    useEffect(() => {
        if (stayInitialValues) form?.setFieldsValue({stay: stayInitialValues});
    }, [form, stayInitialValues]);

    const onFinish = (values: Record<string, any>) => {
        setStayGeneralErrors([]);
        // Historique : aucun champ séjour n'est envoyé (sinon l'API exige l'annonce complète).
        return formProps.onFinish?.(buildResidencePatch(values, isStay));
    };

    return (
        <Edit
            title={`${translate(`actions.edit`)} Residence`}
            breadcrumb={null}
            footerButtons={() => (<></>)}
            headerButtons={
                <Space>
                    <Button
                        icon={<OrderedListOutlined/>}
                        onClick={goBack}
                    >
                        Residences
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            form?.resetFields();
                            if (stayInitialValues) form?.setFieldsValue({stay: stayInitialValues});
                            setStayGeneralErrors([]);
                        }}
                    >
                        Refresh
                    </Button>
                    <DeleteButton
                        recordItemId={residencesData?.id}
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
            <Form {...formProps} onFinish={onFinish} layout="vertical" >
                <Row gutter={[32, 32]} style={{ marginTop: 32,}}>
                    <Col xs={24} md={24} lg={24} xl={16}>
                        <ResidenceDataFields translate={translate} residencesData={residencesData} />
                    </Col>
                    <Col xs={24} md={24} lg={24} xl={8}>
                        <ResidenceEditActionFields translate={translate} ownerId={extractRelationId(residencesData?.proprietaire)} />
                    </Col>
                </Row>
                {isStay && (
                    <StayResidenceSection residence={residencesData} generalErrors={stayGeneralErrors} />
                )}
            </Form>

            <SeedResidenceRating residenceId={residencesData?.id} />
        </Edit>
    );
};



