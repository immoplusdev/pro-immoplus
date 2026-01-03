import type {GetProp, UploadProps} from "antd";

export type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

export const supportedImageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'];