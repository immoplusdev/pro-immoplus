import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";
import { PROJECT_NAME } from "@/configs/app.config";
import {AppIcon} from "@/components";

export const Register = () => {
  return (
    <AuthPage
      type="register"
      title={
        <ThemedTitleV2
          collapsed={false}
          text={PROJECT_NAME}
          icon={<AppIcon />}
        />
      }
    />
  );
};
