import React from "react";
import { useLogin } from "@refinedev/core";
import {
    Row,
    Col,
    Layout as AntdLayout,
    Card,
    Typography,
    Form,
    Input,
    Button,
    Checkbox,
} from "antd";
import {AppIcon} from "@/components";
import {Link} from "react-router-dom";

const { Text, Title } = Typography;

export interface ILoginForm {
    email: string;
    password: string;
    remember: boolean;
}

export const Login: React.FC = () => {
    const [form] = Form.useForm<ILoginForm>();

    const { mutate: login } = useLogin<ILoginForm>();


    const CardTitle = (
        <Title level={3} style={{display:"flex", justifyContent:"center", color: "#4096ff",  fontSize: "30px", letterSpacing:"-0.04em", paddingTop:"20px"}}>
            
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
                    <div style={{maxWidth: "408px", margin:"auto"}}>
                        <div style={{
                            width:"100%",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            gap:"10px",
                            marginBottom:"16px"}}
                        >
                            <AppIcon/>
                            <span style={{fontWeight:"700"}}>Immoplus</span>
                        </div>
                        <Card title={CardTitle} headStyle={{ borderBottom: 0 }}>
                            <Form
                                layout="vertical"
                                form={form}
                                onFinish={(values) =>{
                                    login(values)
                                }}
                                requiredMark={false}
                                initialValues={{
                                    remember: false,
                                }}
                            >
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[{ required: true }]}
                                >
                                    <Input type="text" size="large" placeholder="Email" />
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    label="Password"
                                    rules={[{ required: true }]}
                                    style={{ marginBottom: "12px" }}
                                >
                                    <Input type="password" placeholder="●●●●●●●●" size="large" />
                                </Form.Item>
                                <div style={{ marginBottom: "12px" }}>
                                    <Form.Item name="remember" valuePropName="checked" noStyle>
                                        <Checkbox
                                            style={{
                                                fontSize: "12px",
                                            }}
                                        >
                                            Remember me
                                        </Checkbox>
                                    </Form.Item>

                                    <a
                                        style={{
                                            float: "right",
                                            fontSize: "12px",
                                            color: "#4096ff"
                                        }}
                                        href="#"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <Button type="primary" size="large" htmlType="submit" block>
                                    Sign in
                                </Button>
                            </Form>
                            <div style={{ marginTop: 8 }}>
                                <Text style={{ fontSize: 12 }}>
                                    Don’t have an account?{" "}
                                    <Link to="/register" style={{ fontWeight: "bold" }}>
                                        Sign up
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