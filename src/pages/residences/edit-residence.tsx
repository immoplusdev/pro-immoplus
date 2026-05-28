import React from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {OrderedListOutlined, ReloadOutlined, SaveOutlined} from "@ant-design/icons"
import {DeleteButton, Edit, useForm} from "@refinedev/antd";
import {ResidenceEditActionFields} from "@/pages/residences/components/edit-actions-fields";
import {ResidenceDataFields} from "@/pages/residences/components/edit-read-only-fields";
import {useOne, useTranslate} from "@refinedev/core";
import {Button, Col, Form, Row, Space} from "antd";




export const EditResidence: React.FC = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const location = useLocation();
    const goBack = () => navigate((location.state as any)?.from || -1);
    const { formProps, saveButtonProps, queryResult, form } = useForm({
        redirect: false,
        onMutationSuccess: goBack,
    });
    const residencesData = queryResult?.data?.data;

    const { data: ownerData, isLoading: ownerLoading } = useOne({
        resource: "users",
        id: residencesData?.proprietaire || "",
        queryOptions: {
            enabled: !!residencesData?.proprietaire,
        },
    });


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
                        onClick={() => form?.resetFields()}
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
            <Form {...formProps} layout="vertical" >
                <Row gutter={[32, 32]} style={{ marginTop: 32,}}>
                    <Col xs={24} md={24} lg={24} xl={16}>
                        <ResidenceDataFields translate={translate} residencesData={residencesData} />
                    </Col>
                    <Col xs={24} md={24} lg={24} xl={8}>
                        <ResidenceEditActionFields translate={translate} ownerData={ownerData?.data} ownerLoading={ownerLoading} />
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};



