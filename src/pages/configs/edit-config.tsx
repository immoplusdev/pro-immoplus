import {IResourceComponentsProps, useCustom} from "@refinedev/core";
import {Edit, useForm} from "@refinedev/antd";
import {Col, Form, Row} from "antd";
import React, {useMemo} from "react";
import {ConfigEditActionFields} from "@/pages/configs/components/edit-actions-fields";
import {ConfigDataFields} from "@/pages/configs/components/edit-read-only-fields";
import {API_URL} from "@/configs";
import AppLoader from "@/components/loading/app-loader";
import {SpinLoader} from "@/components/loading";


export const EditConfig: React.FC<IResourceComponentsProps> = () => {

    const {isLoading, isFetching, isInitialLoading, data} = useCustom({
        method: "get",
        url: `${API_URL}/configs`
    })

    // const configs = useMemo(() => data?.data, [data?.data, isFetching]);

    const {formProps, saveButtonProps} = useForm({
        defaultFormValues: data?.data,
        action: "edit"
        // onsubmit: (values) => {{}
    });


    return isInitialLoading || isLoading || isFetching ? <SpinLoader/> :
        (
            <Edit saveButtonProps={saveButtonProps}>
                <Form {...formProps} layout="vertical">
                    <Row gutter={[32, 32]} style={{marginTop: 32,}}>
                        <Col xs={24} md={24} lg={24} xl={16}>
                            <ConfigDataFields data={data?.data}/>
                        </Col>
                        <Col xs={24} md={24} lg={24} xl={8}>
                            <ConfigEditActionFields/>
                        </Col>
                    </Row>
                </Form>
            </Edit>


        );
};

