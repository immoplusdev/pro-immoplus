import React from "react";
import {useShow, useTranslate} from "@refinedev/core";
import {Show} from "@refinedev/antd";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {Image} from "antd";
import {getImageUrl} from "@/lib/helpers";


export const ShowUser = () => {
    const translate = useTranslate();
    const {queryResult} = useShow();
    const {data, isLoading} = queryResult;

    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
                {/*<Image*/}
                {/*    src={getImageUrl(record?.avatar)}*/}
                {/*    alt="image"*/}
                {/*    style={{*/}
                {/*        height: "200px",*/}
                {/*        width: "200px",*/}
                {/*        objectFit: "cover"*/}
                {/*    }}*/}
                {/*/>*/}
                {/*<Image*/}
                {/*    src={getImageUrl(record?.avatar)}*/}
                {/*    alt="image"*/}
                {/*    style={{*/}
                {/*        height: "200px",*/}
                {/*        width: "200px",*/}
                {/*        objectFit: "cover"*/}
                {/*    }}*/}
                {/*/>*/}
                <ReadOnlyFormField label={translate("users.fields.firstname")} content={record?.firstName}
                                   isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.lastname")} content={record?.lastName}
                                   isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.email")} content={record?.email}
                                   isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.password")} content={record?.password}
                                   isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.phone_number")} content={record?.phoneNumber}
                                   isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.otp")} content={record?.otp} isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.otp_expiration")} content={record?.otpExpiration}
                                   isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.identity_verified")}
                                   content={record?.identityVerified ? "Yes" : "No"} isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.email_verified")}
                                   content={record?.emailVerified ? "Yes" : "No"} isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.phone_number_verified")}
                                   content={record?.phoneNumberVerified ? "Yes" : "No"} isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.compte_pro_valide")}
                                   content={record?.compteProValide ? "Yes" : "No"} isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.auth_login_attempts")}
                                   content={record?.authLoginAttempts ?? ""} isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.status")} content={record?.status}
                                   isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("fields.created_at")} content={record?.createdAt}
                                   isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("fields.updated_at")} content={record?.updatedAt}
                                   isLoading={isLoading}/>

                <ReadOnlyFormField label={translate("users.fields.role")} content={record?.role?.name}
                                   isLoading={isLoading}/>
            </ColList>
        </Show>
    );
};
