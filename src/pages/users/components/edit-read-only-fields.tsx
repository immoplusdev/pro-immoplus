import React from "react";
import { BaseRecord } from "@refinedev/core";
import { Card, Form, Input, Space } from "antd";
import { DatabaseOutlined, EditOutlined } from "@ant-design/icons";
import { ReadOnlyFormField } from "@/lib/ts-utilities";
import { formatAmount, getApiFileUrl } from "@/lib/helpers";
import { ListUserTransactionsTable } from "./list-transactions-table";
import { WalletCreditForm } from "./wallet-credit-form";
import { WalletDebitForm } from "./wallet-debit-form";
import { WalletReleaseFundsForm } from "./wallet-release-funds-form";
import { WalletTransferForm } from "./wallet-transfer-form";
import { FilePreviewModal } from "./file-preview";
import { UserProStatistics } from "./user-pro-statistics";
import { ProCertificationCard } from "./pro-certification/pro-certification-card";
import { UserNotificationsTable } from "./user-notifications";

export const UsersEditDataFields: React.FC<{
  translate: any;
  data?: BaseRecord;
  walletData?: BaseRecord;
  onWalletUpdate?: () => void;
}> = ({ translate, data, walletData, onWalletUpdate }) => {
  console.log("data", data);
  return (
    <>
      <Card
        style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
        title={
          <Space>
            <EditOutlined />
            <p>{translate("users.fields.data")}</p>
          </Space>
        }
        headStyle={{ padding: "1rem" }}
        bodyStyle={{
          padding: "2rem",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Card style={{ border: "none", width: "50%" }}>
          <Form.Item
            label={translate("users.fields.lastname")}
            name={["lastName"]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={translate("users.fields.firstname")}
            name={["firstName"]}
          >
            <Input />
          </Form.Item>
          <Form.Item label={translate("users.fields.email")} name={["email"]}>
            <Input />
          </Form.Item>
          <Form.Item
            label={translate("users.fields.phone_number")}
            name={["phoneNumber"]}
          >
            <Input />
          </Form.Item>
          <ReadOnlyFormField
            label={translate("fields.updated_at")}
            content={new Date(data?.updatedAt).toLocaleDateString()}
          />
        </Card>
        <Card style={{ width: "50%", border: "none" }}>
          <ReadOnlyFormField
            label={translate("users.fields.identity_verified")}
            content={data?.identityVerified ? "Oui" : "Non"}
          />
          <ReadOnlyFormField
            label={translate("users.fields.email_verified")}
            content={data?.emailVerified ? "Oui" : "Non"}
          />
          <ReadOnlyFormField
            label={translate("users.fields.phone_number_verified")}
            content={data?.phoneNumberVerified ? "Oui" : "Non"}
          />
          <ReadOnlyFormField
            label={translate("users.fields.compte_pro_valide")}
            content={data?.compteProValide ? "Oui" : "Non"}
          />
          <ReadOnlyFormField
            label={translate("users.fields.auth_login_attempts")}
            content={data?.authLoginAttempts}
          />
        </Card>
      </Card>

      {/* Informations Entreprise */}
      <Card
        style={{
          display: data?.role?.name === "pro_entreprise" ? "" : "None",
          marginTop: "2rem",
          border: "1px solid #E8E9EE",
          borderRadius: 10,
        }}
        title={
          <Space>
            <EditOutlined />
            <p>Informations Entreprise</p>
          </Space>
        }
        headStyle={{ padding: "1rem" }}
        bodyStyle={{
          padding: "2rem",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Card style={{ border: "none", width: "50%" }}>
          <Form.Item
            label="Nom Entreprise"
            name={["additionalData", "nomEntreprise"]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Activité" name={["additionalData", "activite"]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Email Entreprise"
            name={["additionalData", "emailEntreprise"]}
          >
            <Input />
          </Form.Item>
        </Card>
        <Card style={{ width: "50%", border: "none" }}>
          <Form.Item
            label="Numéro Contribuable"
            name={["additionalData", "numeroContribuable"]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Type Entreprise"
            name={["additionalData", "typeEntreprise"]}
          >
            <Input />
          </Form.Item>
          <ReadOnlyFormField
            label="Registre de Commerce"
            content={
              data?.additionalData?.registreCommerceId ? (
                <FilePreviewModal
                  fileUrl={getApiFileUrl(
                    data.additionalData.registreCommerceId,
                  )}
                  label="Voir le document"
                />
              ) : (
                "Non fourni"
              )
            }
          />
        </Card>
      </Card>

      {/* Informations Pro Particulier */}
      <Card
        style={{
          display: data?.role?.name === "pro_particulier" ? "" : "None",
          marginTop: "2rem",
          border: "1px solid #E8E9EE",
          borderRadius: 10,
        }}
        title={
          <Space>
            <EditOutlined />
            <p>Informations Professionnel Particulier</p>
          </Space>
        }
        headStyle={{ padding: "1rem" }}
        bodyStyle={{
          padding: "2rem",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Card style={{ border: "none", width: "50%" }}>
          <Form.Item
            label="Lieu de Naissance"
            name={["additionalData", "lieuNaissance"]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Activité" name={["additionalData", "activite"]}>
            <Input />
          </Form.Item>
          <ReadOnlyFormField
            label="Photo d'Identité"
            content={
              data?.additionalData?.photoIdentiteId ? (
                <FilePreviewModal
                  fileUrl={getApiFileUrl(data.additionalData.photoIdentiteId)}
                  label="Voir le document"
                />
              ) : (
                "Non fourni"
              )
            }
          />
        </Card>
        <Card style={{ width: "50%", border: "none" }}>
          <ReadOnlyFormField
            label="Pièce d'Identité (Recto)"
            content={
              data?.additionalData?.pieceIdentiteId ? (
                <FilePreviewModal
                  fileUrl={getApiFileUrl(data.additionalData.pieceIdentiteId)}
                  label="Voir le document"
                />
              ) : (
                "Non fourni"
              )
            }
          />
          <ReadOnlyFormField
            label="Pièce d'Identité (Verso)"
            content={
              data?.additionalData?.pieceIdentiteVersoId ? (
                <FilePreviewModal
                  fileUrl={getApiFileUrl(
                    data.additionalData.pieceIdentiteVersoId,
                  )}
                  label="Voir le document"
                />
              ) : (
                "Non fourni"
              )
            }
          />
        </Card>
      </Card>

      {/* Detail de Portefeuille */}
      <Card
        style={{
          display:
            data?.role?.name === "pro_entreprise" ||
            data?.role?.name === "pro_particulier"
              ? ""
              : "None",
          marginTop: "2rem",
          border: "1px solid #E8E9EE",
          borderRadius: 10,
        }}
        title={
          <Space>
            <DatabaseOutlined />
            <p>{translate("users.fields.wallet")}</p>
          </Space>
        }
        headStyle={{ padding: "1rem" }}
        bodyStyle={{
          padding: "2rem",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Card style={{ border: "none", width: "50%" }}>
          <ReadOnlyFormField
            label={translate("users.fields.available_balance")}
            content={formatAmount(walletData?.availableBalance)}
          />
        </Card>
        <Card style={{ width: "50%", border: "none" }}>
          <ReadOnlyFormField
            label={translate("users.fields.pending_balance")}
            content={formatAmount(walletData?.pendingBalance)}
          />
        </Card>
      </Card>

      <div
        style={{
          display:
            data?.role?.name === "pro_entreprise" ||
            data?.role?.name === "pro_particulier"
              ? ""
              : "None",
          marginTop: "2rem",
        }}
      >
        <WalletCreditForm translate={translate} onSuccess={onWalletUpdate} />
      </div>

      <div
        style={{
          display:
            data?.role?.name === "pro_entreprise" ||
            data?.role?.name === "pro_particulier"
              ? ""
              : "None",
          marginTop: "2rem",
        }}
      >
        <WalletDebitForm translate={translate} onSuccess={onWalletUpdate} />
      </div>

      <div
        style={{
          display:
            data?.role?.name === "pro_entreprise" ||
            data?.role?.name === "pro_particulier"
              ? ""
              : "None",
          marginTop: "2rem",
        }}
      >
        <WalletReleaseFundsForm
          translate={translate}
          onSuccess={onWalletUpdate}
        />
      </div>

      <div
        style={{
          display:
            data?.role?.name === "pro_entreprise" ||
            data?.role?.name === "pro_particulier"
              ? ""
              : "None",
          marginTop: "2rem",
        }}
      >
        <WalletTransferForm translate={translate} onSuccess={onWalletUpdate} />
      </div>

      {(data?.role?.name === "pro_entreprise" ||
        data?.role?.name === "pro_particulier") && (
        <>
          <UserProStatistics proId={data?.id ? String(data.id) : undefined} />
          <ProCertificationCard
            proId={data?.id ? String(data.id) : undefined}
          />
        </>
      )}

      <UserNotificationsTable userId={data?.id ? String(data.id) : undefined} />

      <Card
        style={{
          display: "None",
          marginTop: "2rem",
          border: "1px solid #E8E9EE",
          borderRadius: 10,
        }}
        title={
          <Space>
            <DatabaseOutlined />
            <p>{translate("users.fields.user_transactions")}</p>
          </Space>
        }
        headStyle={{ padding: "1rem" }}
        bodyStyle={{
          padding: "2rem",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <ListUserTransactionsTable activeMenu={"customer"} filters={{}} />
      </Card>
    </>
  );
};
