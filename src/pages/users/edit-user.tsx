import React from "react";
import { DeleteButton, Edit, useForm } from "@refinedev/antd";
import { Button, Col, Form, Row, Space, Tabs } from "antd";
import type { TabsProps } from "antd";
import { useCustom, useTranslate } from "@refinedev/core";
import { UsersEditDataFields } from "./components/edit-read-only-fields";
import { UsersEditActionFields } from "./components/edit-actions-fields";
import {
  OrderedListOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { API_URL } from "@/configs/app.config";
import { canAccessResource } from "@/configs/role-permissions.config";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";
import { isAdminViewer } from "@/components/auth/is-admin-viewer";
import { UserLocationTab } from "./components/user-location-tab";

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

  // Onglet "Localisation" : données GPS sensibles, réservé au rôle Admin (masqué sinon, même via ?tab=).
  const isAdmin = isAdminViewer();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = isAdmin && searchParams.get("tab") === "localisation" ? "localisation" : "informations";
  const onTabChange = (key: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (key === "informations") next.delete("tab");
        else next.set("tab", key);
        return next;
      },
      { replace: true }
    );

  const informations = (
    <Form {...formProps} layout="vertical">
      <Row gutter={[32, 32]} style={{ marginTop: 16 }}>
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
  );

  const tabItems: TabsProps["items"] = [
    // forceRender : le formulaire doit rester monté même en arrivant directement sur ?tab=localisation.
    { key: "informations", label: "Informations", children: informations, forceRender: true },
    ...(isAdmin
      ? [{ key: "localisation", label: "Localisation", children: <UserLocationTab userId={userId} /> }]
      : []),
  ];

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
      <Tabs activeKey={activeTab} onChange={onTabChange} items={tabItems} />
    </Edit>
  );
};
