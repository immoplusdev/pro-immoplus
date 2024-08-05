import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";
import { AppIcon } from "../../components/app-icon";
import { PROJECT_NAME } from "@/configs/app.config";

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
