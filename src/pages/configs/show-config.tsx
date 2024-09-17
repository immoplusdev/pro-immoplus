import { IResourceComponentsProps } from "@refinedev/core";
import { AntdShowInferencer } from "@refinedev/inferencer/antd";

export const ShowConfig: React.FC<IResourceComponentsProps> = () => {
  return <AntdShowInferencer resource="configs"/>;
};
