import React from "react";
import {DeleteButton, Edit, useForm, ImageField} from "@refinedev/antd";
import {Button, Card, Col, Descriptions, Form, Input, Row, Select, Space, Spin} from "antd";
import {useOne, useTranslate} from "@refinedev/core";
import {DatabaseOutlined, EditOutlined, OrderedListOutlined, ReloadOutlined, SaveOutlined, UserOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {formatAmount, getApiFileUrl} from "@/lib/helpers";
import {ShowUserButton} from "@/pages/users/components";

export const EditFurniture: React.FC = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const {formProps, saveButtonProps, queryResult, form} = useForm();
    const furnitureData = queryResult?.data?.data;

    const ownerId = furnitureData?.owner?.id || furnitureData?.owner;

    const {data: ownerData, isLoading: ownerLoading} = useOne({
        resource: "users",
        id: ownerId || "",
        queryOptions: {
            enabled: !!ownerId && typeof ownerId === "string",
        },
    });

    const ownerRecord = typeof furnitureData?.owner === "object" ? furnitureData?.owner : ownerData?.data;

    const images: string[] = furnitureData?.images
        ? (Array.isArray(furnitureData.images) ? furnitureData.images : [furnitureData.images])
        : [];

    const statusOptions = [
        {value: "active", label: translate("furnitures.status.active")},
        {value: "inactive", label: translate("furnitures.status.inactive")},
        {value: "pending", label: translate("furnitures.status.pending")},
    ];

    return (
        <Edit
            title={`${translate("actions.edit")} Meuble`}
            breadcrumb={null}
            footerButtons={() => (<></>)}
            headerButtons={
                <Space>
                    <Button
                        icon={<OrderedListOutlined/>}
                        onClick={() => navigate("/furnitures")}
                    >
                        {translate("furnitures.title")}
                    </Button>
                    <Button
                        icon={<ReloadOutlined/>}
                        onClick={() => form?.resetFields()}
                    >
                        Refresh
                    </Button>
                    <DeleteButton
                        recordItemId={furnitureData?.id}
                        onSuccess={() => navigate("/furnitures")}
                    />
                    <Button
                        type="primary"
                        icon={<SaveOutlined/>}
                        {...saveButtonProps}
                    >
                        {translate("buttons.save")}
                    </Button>
                </Space>
            }
        >
            <Form {...formProps} layout="vertical">
                <Row gutter={[32, 32]} style={{marginTop: 32}}>
                    <Col xs={24} md={24} lg={16}>
                        <Card
                            title={
                                <Space>
                                    <DatabaseOutlined/>
                                    <p>{translate("furnitures.title")}</p>
                                </Space>
                            }
                            headStyle={{padding: "1rem", border: "0.5px solid black"}}
                            bodyStyle={{padding: "2rem", border: "0.5px solid black", display: "flex", flexDirection: "row"}}
                        >
                            <Card style={{border: "none", width: "50%"}}>
                                <ReadOnlyFormField label={translate("furnitures.fields.titre")}
                                                   content={furnitureData?.titre}/>
                                <ReadOnlyFormField label={translate("furnitures.fields.type")}
                                                   content={furnitureData?.type}/>
                                <ReadOnlyFormField label={translate("furnitures.fields.category")}
                                                   content={furnitureData?.category}/>
                            </Card>
                            <Card style={{border: "none", width: "50%"}}>
                                <ReadOnlyFormField label={translate("furnitures.fields.etat")}
                                                   content={furnitureData?.etat}/>
                                <ReadOnlyFormField label={translate("furnitures.fields.prix")}
                                                   content={furnitureData?.prix ? formatAmount(furnitureData.prix) : ""}/>
                                <ReadOnlyFormField label={translate("furnitures.fields.adresse")}
                                                   content={furnitureData?.adresse}/>
                            </Card>
                        </Card>
                        <Card
                            style={{marginTop: 16}}
                            headStyle={{padding: "1rem", border: "0.5px solid black"}}
                            bodyStyle={{padding: "2rem", border: "0.5px solid black"}}
                        >
                            <Form.Item label={translate("fields.description")} name={["description"]}>
                                <Input.TextArea
                                    autoSize={{minRows: 3, maxRows: 8}}
                                    style={{border: "0.5px solid black"}}
                                />
                            </Form.Item>
                        </Card>
                        {images.length > 0 && (
                            <Card
                                style={{marginTop: 16}}
                                headStyle={{padding: "1rem", border: "0.5px solid black"}}
                                bodyStyle={{padding: "2rem", border: "0.5px solid black"}}
                            >
                                <Form.Item label={translate("fields.images")}>
                                    <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                                        {images.map((imageId: string, index: number) => (
                                            <ImageField
                                                key={index}
                                                value={getApiFileUrl(imageId)}
                                                width={200}
                                            />
                                        ))}
                                    </div>
                                </Form.Item>
                            </Card>
                        )}
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Card
                            title={
                                <Space>
                                    <EditOutlined/>
                                    <p>Actions</p>
                                </Space>
                            }
                            headStyle={{padding: "1rem", border: "0.5px solid black"}}
                            bodyStyle={{padding: "2rem", border: "0.5px solid black"}}
                        >
                            <Form.Item
                                label={translate("furnitures.fields.status")}
                                style={{width: "17vw"}}
                                name={["status"]}
                                rules={[{required: true}]}
                            >
                                <Select
                                    style={{border: "0.5px solid black", borderRadius: "7px"}}
                                    options={statusOptions}
                                />
                            </Form.Item>
                        </Card>

                        <Card
                            style={{marginTop: 16}}
                            title={
                                <Space>
                                    <UserOutlined/>
                                    <p>{translate("furnitures.sections.owner")}</p>
                                </Space>
                            }
                            headStyle={{padding: "1rem", border: "0.5px solid black"}}
                            bodyStyle={{padding: "2rem", border: "0.5px solid black"}}
                        >
                            {ownerLoading && typeof ownerId === "string" ? (
                                <Spin/>
                            ) : ownerRecord ? (
                                <>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label={translate("fields.nom")}>
                                            {ownerRecord.firstName || ownerRecord.firstname}{" "}
                                            {ownerRecord.lastName || ownerRecord.lastname}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={translate("fields.email")}>
                                            {ownerRecord.email}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={translate("fields.phone_number")}>
                                            {ownerRecord.phoneNumber}
                                        </Descriptions.Item>
                                    </Descriptions>
                                    <div style={{marginTop: 16}}>
                                        <ShowUserButton
                                            id={String(ownerRecord.id || ownerId)}
                                            title={translate("users.common.see_owner")}
                                        />
                                    </div>
                                </>
                            ) : (
                                <p>{translate("furnitures.sections.no_owner")}</p>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};
