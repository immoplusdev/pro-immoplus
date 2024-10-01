import React from "react";
import {DeleteButton, Edit, useForm} from "@refinedev/antd";
import {Button, Col, Form, Row, Space} from "antd";
import { useTranslate } from "@refinedev/core";
import {ImageCarousel} from "@/components/images/image-carousel";
import {getCarouselUrls} from "@/lib/helpers";
import {BienImmobilierDataFields} from "@/pages/biens-immobiliers/components/edit-read-only-fields";
import {BienImmobilierEditActionFields} from "@/pages/biens-immobiliers/components/edit-actions-fields";
import {OrderedListOutlined, ReloadOutlined, SaveOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";


// Main Edit Component
export const EditBienImmobilier: React.FC = () => {
    const translate = useTranslate();
    const navigate = useNavigate()
    const { formProps, saveButtonProps, queryResult, form } = useForm();
    const biensImmobiliersData = queryResult?.data?.data;

    return (
        <Edit
            saveButtonProps={saveButtonProps}
            footerButtons={() => (<></>)}
            headerButtons={
                <Space>
                    <Button
                        icon={<OrderedListOutlined/>}
                        onClick={() => navigate("/biens-immobiliers")}
                    >
                        Demandes visites
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => form?.resetFields()}
                    >
                        Refresh
                    </Button>
                    <DeleteButton
                        recordItemId={biensImmobiliersData?.id}
                        onSuccess={() =>navigate('/demandes-visites')}
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
                    <Col xs={24} md={24} lg={16}>
                        <BienImmobilierDataFields translate={translate} data={biensImmobiliersData}/>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <BienImmobilierEditActionFields translate={translate}/>
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};



