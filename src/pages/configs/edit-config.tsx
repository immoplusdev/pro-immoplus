import {IResourceComponentsProps, useCustom} from "@refinedev/core";
import {Edit, useForm} from "@refinedev/antd";
import {Col, Form, Row} from "antd";
import React, {useMemo} from "react";
import {ConfigEditActionFields} from "@/pages/configs/components/edit-actions-fields";
import {ConfigDataFields} from "@/pages/configs/components/edit-read-only-fields";
import {API_URL} from "@/configs";
import AppLoader from "@/components/loading/app-loader";


export const EditConfig: React.FC<IResourceComponentsProps> = () => {

    const {isLoading, data} = useCustom({
        method: "get",
        url: `${API_URL}/configs`
    })

    const configs = useMemo(() => data?.data, [data?.data]);
    const {formProps, saveButtonProps} = useForm({
        defaultFormValues: configs,
    });

    return isLoading ? <AppLoader/> :
        (
            <Edit saveButtonProps={saveButtonProps}>
                <Form {...formProps} layout="vertical">
                    <Row gutter={[32, 32]} style={{marginTop: 32,}}>
                        <Col xs={24} md={24} lg={24} xl={16}>
                            <ConfigDataFields data={configs}/>
                        </Col>
                        <Col xs={24} md={24} lg={24} xl={8}>
                            <ConfigEditActionFields/>
                        </Col>
                    </Row>
                </Form>
            </Edit>


        );
};

