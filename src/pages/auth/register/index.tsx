import { useRegister } from "@refinedev/core";
import { Layout as AntdLayout, Row, Col, Card, Form, Input, Checkbox, Button, Typography } from 'antd';
import {AppIcon} from "@/components";
import {Link} from "react-router-dom";
import React from "react";


type RegisterVariables = {
    email: string;
    password: string;
};

const { Text, Title } = Typography;
export const Register = () => {
    const { mutate: register } = useRegister<RegisterVariables>();
    const [form] = Form.useForm();
    const CardTitle = (
        <Title level={3} style={{display:"flex", justifyContent:"center", color: "#4096ff",  fontSize: "30px", letterSpacing:"-0.04em", paddingTop:"20px"}}>
            Register
        </Title>
    );

    return (

        <AntdLayout>
            <Row
                justify="center"
                align="middle"
                style={{
                    height: "100vh",
                }}
            >
                <Col xs={22}>
                    <div style={{ maxWidth: "408px", margin: "auto" }}>
                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                marginBottom: "16px",
                            }}
                        >
                            <AppIcon />
                            <span style={{ fontWeight: "700" }}>Immoplus</span>
                        </div>
                        <Card title={CardTitle} headStyle={{ borderBottom: 0 }}>
                            <Form
                                layout="vertical"
                                form={form}
                                onFinish={values => {
                                    console.log(values)
                                    register(values)
                                }}
                                requiredMark={false}
                            >
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[{ required: true, message: "Please enter your email" }]}
                                >
                                    <Input type="text" size="large" placeholder="Email" />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    label="Password"
                                    rules={[{ required: true, message: "Please enter your password" }]}
                                    style={{ marginBottom: "46px" }}
                                >
                                    <Input type="password" placeholder="●●●●●●●●" size="large" />
                                </Form.Item>

                                {/*<Form.Item*/}
                                {/*    name="confirmPassword"*/}
                                {/*    label="Confirm Password"*/}
                                {/*    rules={[*/}
                                {/*        { required: true, message: "Please confirm your password" },*/}
                                {/*        ({ getFieldValue }) => ({*/}
                                {/*            validator(_, value) {*/}
                                {/*                if (!value || getFieldValue('password') === value) {*/}
                                {/*                    return Promise.resolve();*/}
                                {/*                }*/}
                                {/*                return Promise.reject(new Error('Passwords do not match!'));*/}
                                {/*            },*/}
                                {/*        }),*/}
                                {/*    ]}*/}
                                {/*    style={{ marginBottom: "12px" }}*/}
                                {/*>*/}
                                {/*    <Input type="password" placeholder="●●●●●●●●" size="large" />*/}
                                {/*</Form.Item>*/}

                                <Button type="primary" size="large" htmlType="submit" block>
                                    Sign up
                                </Button>
                            </Form>

                            <div style={{ marginTop: 8 }}>
                                <Text style={{ fontSize: 12 }}>
                                    Already have an account?{" "}
                                    <Link to="/login" style={{ fontWeight: "bold" }}>
                                        Sign in
                                    </Link>
                                </Text>
                            </div>
                        </Card>
                    </div>
                </Col>
            </Row>
        </AntdLayout>
    );
};
