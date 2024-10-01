import React from "react";
import {OrderedListOutlined, ReloadOutlined, SaveOutlined} from "@ant-design/icons"
import {DeleteButton, Edit, useForm} from "@refinedev/antd";
import {Button, Col, Form, Row, Space} from "antd";
import {useTranslate} from "@refinedev/core";
import {ResidenceEditDataFields} from "@/pages/residences/components/edit-read-only-fields";
import {ResidenceEditActionFields} from "@/pages/residences/components/edit-actions-fields";
import {useNavigate} from "react-router-dom";




export const EditResidence: React.FC = () => {
    const translate = useTranslate();
    const { formProps, saveButtonProps, queryResult, form } = useForm();
    const residencesData = queryResult?.data?.data;
    const navigate = useNavigate()


    return (
        <Edit
            footerButtons={() => (<></>)}
            headerButtons={
                <Space>
                    <Button
                        icon={<OrderedListOutlined/>}
                        onClick={() => navigate("/residences")}
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
                        onSuccess={() =>navigate('/residences')}
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
            <Form {...formProps} layout="vertical" >
                <Row gutter={[32, 32]} style={{ marginTop: 32,}}>
                    <Col xs={24} md={24} lg={24} xl={16}>
                        <ResidenceEditDataFields translate={translate} residencesData={residencesData} />
                    </Col>
                    <Col xs={24} md={24} lg={24} xl={8}>
                        <ResidenceEditActionFields translate={translate} />
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};



