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
import { canAccessResource } from "@/configs/role-permissions.config";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";

const localStorageProvider = getLocalStorageProvider();

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

  const viewerRole = localStorageProvider.getAuthData()?.role;
  // Ces sections tapent des endpoints admin-only (wallet, certification, stats pro) :
  // un viewer sans le droit "wallets" reçoit des 401/403 en boucle sur ces appels.
  const canViewFinancialData = viewerRole ? canAccessResource(viewerRole, "wallets") : false;

  const { data: walletQuery, isLoading: walletIsLoading, refetch: refetchWallet } = useCustom({
    url: `${API_URL}/wallet/admin/user-wallet/${userId}`,
    method: "get",
    meta: {
      resource: "wallets",
      action: "getOne",
    },
    queryOptions: {
      enabled: canViewFinancialData && !!userId,
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
              canViewFinancialData={canViewFinancialData}
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
