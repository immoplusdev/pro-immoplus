import React from 'react';
import {InboxOutlined} from '@ant-design/icons';
import type {UploadFile, UploadProps} from 'antd';
import {Upload} from 'antd';
import {getFileUploadEndpointUrl, onPreview, uploadFileToServer} from "@/components/form/file/file-utils";
import {useTranslate} from "@refinedev/core";
import {axiosInstance} from "@/lib/providers/utils";

type Props = {
    name: string;
    authentified?: boolean,
    multiple?: boolean,
    accept?: string
}


const {Dragger} = Upload;

export function DragAndDropImageUploader({authentified, multiple, name, accept}: Props) {

    const allowMultiple = multiple ?? true;

    const translate = useTranslate();

    const props: UploadProps = {
        name,
        multiple: allowMultiple,
        data: (file: UploadFile) => uploadFileToServer(file, authentified),
        listType: "picture-card",
        onPreview,
        accept,
    };


    return (
        <Dragger {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined/>
            </p>
            <p className="ant-upload-text">{translate("files.file_upload.drag_and_drop_image_uploader_title")}</p>
            <p className="ant-upload-hint">
                {translate("files.file_upload.drag_and_drop_image_uploader_description")}
            </p>
        </Dragger>
    )
}
