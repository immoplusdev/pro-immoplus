import type {UploadFile, UploadProps} from "antd";
import {FileType} from "@/components/form/file";
import {API_URL} from "@/configs";
import {axiosInstance} from "@/lib/providers/utils";
import {getValueFromEvent} from "@refinedev/antd/src/definitions/upload";
import type {UploadChangeParam} from "antd/lib/upload/interface";
import {getImageUrl} from "@/lib/helpers";

export const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
        src = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file.originFileObj as FileType);
            reader.onload = () => resolve(reader.result as string);
        });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
};

export const getFileUploadEndpointUrl = (authentified?: boolean) => {
    return `${API_URL}/files/${authentified ? '' : 'public'}`
}

export const uploadFileToServer = async (file: UploadFile, isAuthentified?: boolean) => {
    const url = getFileUploadEndpointUrl(isAuthentified);
    const formData = new FormData();
    formData.append("file", file as never);
    try {
        const response = await axiosInstance.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return {file: {...file, uid: response.data?.id}, response: response.data};
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

export const defaultFileUploadProps: UploadProps = {
    multiple: false,
    action: getFileUploadEndpointUrl(),
    listType: "picture-card",
    onPreview: onPreview
}

export const getFileValuePropsToFilesId = (value: any) => {
    return value;
}

export const getFileIdsFromEvent = (event: UploadChangeParam): string[] | null => {
    const {fileList} = event;
    if (!Array.isArray(fileList)) return null;
    return fileList.map(file => file?.response?.data?.id);
}

export function getFileIdFromEvent(event: UploadChangeParam): string | null {
    const {fileList} = event;
    const ids = fileList.map(file => file?.response?.data?.id);
    return ids[ids.length - 1] || null;
}

export function ImagesToUploadFilesFormat(miniatureId?: string, images?: string[]): UploadFile[] {
    return [miniatureId].concat(images ? images : []).map(image => ({
        uid: image as string,
        name: image as string,
        url: getImageUrl(image as string),
    }))
}

export const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });