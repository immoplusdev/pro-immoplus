import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Col, Form, Row } from "antd";
import { useTranslate } from "@refinedev/core";
import {ImageCarousel} from "@/components/images/image-carousel";
import {getCarouselUrls} from "@/lib/helpers";
import {BienImmobilierDataFields} from "@/pages/biens-immobiliers/components/edit-read-only-fields";
import {BienImmobilierEditActionFields} from "@/pages/biens-immobiliers/components/edit-actions-fields";


// Main Edit Component
export const EditBienImmobilier: React.FC = () => {
    const translate = useTranslate();
    const { formProps, saveButtonProps, queryResult } = useForm();
    const biensImmobiliersData = queryResult?.data?.data;

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <div className="w-50 mb-4">
                    <ImageCarousel
                        images={getCarouselUrls(biensImmobiliersData?.miniatureId, biensImmobiliersData?.images)}
                    />
                </div>
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



