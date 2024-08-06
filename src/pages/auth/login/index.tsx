import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";
import { PROJECT_NAME } from "@/configs/app.config";
import {AppIcon} from "@/components";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      title={
        <ThemedTitleV2
          collapsed={false}
          text={PROJECT_NAME}
          icon={<AppIcon />}
        />
      }
      // formProps={{

      //   initialValues: { email: "demo@refine.dev", password: "demodemo" },
      // }}
    />
  );
};
