import { IResourceComponentsProps } from "@refinedev/core";
import {AntdEditInferencer, AntdShowInferencer} from "@refinedev/inferencer/antd";

export const EditConfig: React.FC<IResourceComponentsProps> = () => {
  return <AntdEditInferencer resource="configs" />;
};
