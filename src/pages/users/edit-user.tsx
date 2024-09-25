import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import {Col, Form, Row} from "antd";
import { useTranslate } from "@refinedev/core";
import {UsersEditDataFields} from "@/pages/users/components/edit-read-only-fields";
import { UsersEditActionFields} from "@/pages/users/components/edit-actions-fields";


export const EditUser: React.FC = () => {
    const translate = useTranslate();
    const { formProps, saveButtonProps, queryResult } = useForm();
    const usersData = queryResult?.data?.data;

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
                    <Col xs={24} md={24} lg={16}>
                        <UsersEditDataFields translate={translate} data={usersData} />
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <UsersEditActionFields translate={translate} />
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};

