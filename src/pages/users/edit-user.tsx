import React from "react";
import { DeleteButton, Edit, useForm } from "@refinedev/antd";
import { Button, Col, Form, Row, Space } from "antd";
import { useCustom, useTranslate } from "@refinedev/core";
import { UsersEditDataFields } from "./components/edit-read-only-fields";
import { UsersEditActionFields } from "./components/edit-actions-fields";
import {
  OrderedListOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { API_URL } from "@/configs/app.config";

export const EditUser: React.FC = () => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => navigate((location.state as any)?.from || -1);
  const { id: userId } = useParams<{ id: string }>();
  const { formProps, saveButtonProps, queryResult, form } = useForm({
    redirect: false,
    onMutationSuccess: goBack,
  });
  const usersData = queryResult?.data?.data;

  const { data: walletQuery, isLoading: walletIsLoading, refetch: refetchWallet } = useCustom({
    url: `${API_URL}/wallet/admin/user-wallet/${userId}`,
    method: "get",
    meta: {
      resource: "wallets",
      action: "getOne",
    },
  });
  const walletData = walletQuery?.data;

  return (
    <Edit
      title={`${translate(`actions.edit`)} Utilisateur`}
      breadcrumb={null}
      saveButtonProps={saveButtonProps}
      footerButtons={() => <></>}
      headerButtons={
        <Space>
          <Button
            icon={<OrderedListOutlined />}
            onClick={goBack}
          >
            Users
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => form?.resetFields()}>
            Refresh
          </Button>
          <DeleteButton
            recordItemId={usersData?.id}
            onSuccess={goBack}
          />
          <Button type="primary" icon={<SaveOutlined />} {...saveButtonProps}>
            {translate("buttons.save")}
          </Button>
        </Space>
      }
    >
      <Form {...formProps} layout="vertical">
        <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
          <Col xs={24} md={24} lg={16}>
            <UsersEditDataFields
              translate={translate}
              data={usersData}
              walletData={walletData}
              onWalletUpdate={() => refetchWallet()}
            />
          </Col>
          <Col xs={24} md={24} lg={8}>
            <UsersEditActionFields translate={translate} />
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
