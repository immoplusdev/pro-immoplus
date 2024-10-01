import React from "react";
import {DeleteButton, Edit, useForm} from "@refinedev/antd";
import {Button, Col, Form, Row, Space} from "antd";
import { useTranslate } from "@refinedev/core";
import {UsersEditDataFields} from "@/pages/users/components/edit-read-only-fields";
import { UsersEditActionFields} from "@/pages/users/components/edit-actions-fields";
import {OrderedListOutlined, ReloadOutlined, SaveOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";


export const EditUser: React.FC = () => {
    const translate = useTranslate();
    const navigate = useNavigate()
    const { formProps, saveButtonProps, queryResult, form } = useForm();
    const usersData = queryResult?.data?.data;

    return (
        <Edit
            saveButtonProps={saveButtonProps}
            footerButtons={() => (<></>)}
            headerButtons={
                <Space>
                    <Button
                        icon={<OrderedListOutlined/>}
                        onClick={() => navigate("/users")}
                    >
                        Users
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => form?.resetFields()}
                    >
                        Refresh
                    </Button>
                    <DeleteButton
                        recordItemId={usersData?.id}
                        onSuccess={() =>navigate('/users')}
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

