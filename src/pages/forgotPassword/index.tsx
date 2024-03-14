import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";
import { AppIcon } from "../../components/app-icon";
import { PROJECT_NAME } from "@//config/app.config";

export const ForgotPassword = () => {
  return (
    <AuthPage
      type="forgotPassword"
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
