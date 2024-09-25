import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Col, Form, Row } from "antd";
import { useTranslate } from "@refinedev/core";
import { ImageCarousel } from "@/components/images/image-carousel";
import { getCarouselUrls } from "@/lib/helpers";
import {ResidenceEditDataFields} from "@/pages/residences/components/edit-read-only-fields";
import {ResidenceEditActionFields} from "@/pages/residences/components/edit-actions-fields";

export const EditResidence: React.FC = () => {
    const translate = useTranslate();
    const { formProps, saveButtonProps, queryResult } = useForm();
    const residencesData = queryResult?.data?.data;

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <div className="w-50 mb-4">
                    <ImageCarousel
                        images={getCarouselUrls(residencesData?.miniatureId, residencesData?.images)}
                    />
                </div>

                <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
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



