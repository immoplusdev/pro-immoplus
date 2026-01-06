import React from "react";
import { BaseRecord } from "@refinedev/core";
import { Card, Space } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import { ReadOnlyFormField } from "@/lib/ts-utilities";
import { formatAmount, getApiFileUrl } from "@/lib/helpers";
import { ListUserTransactionsTable } from "./list-transactions-table";
import { WalletCreditForm } from "./wallet-credit-form";
import { WalletDebitForm } from "./wallet-debit-form";
import { WalletReleaseFundsForm } from "./wallet-release-funds-form";

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
        title={
          <Space>
            <DatabaseOutlined />
            <p>{translate("users.fields.data")}</p>
          </Space>
        }
        headStyle={{ padding: "1rem", border: "0.5px solid black" }}
        bodyStyle={{
          padding: "2rem",
          border: "0.5px solid black",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Card style={{ border: "none", width: "50%" }}>
          <ReadOnlyFormField
            label={translate("users.fields.lastname")}
            content={data?.lastName}
          />
          <ReadOnlyFormField
            label={translate("users.fields.firstname")}
            content={data?.firstName}
          />
          <ReadOnlyFormField
            label={translate("users.fields.email")}
            content={data?.email}
          />
          <ReadOnlyFormField
            label={translate("users.fields.phone_number")}
            content={data?.phoneNumber}
          />
          <ReadOnlyFormField
            label={translate("fields.updated_at")}
            content={new Date(data?.updatedAt).toLocaleDateString()}
          />
        </Card>
        <Card style={{ width: "50%", border: "none" }}>
          <ReadOnlyFormField
            label={translate("users.fields.identity_verified")}
            content={data?.identityVerified ? "Yes" : "No"}
          />
          <ReadOnlyFormField
            label={translate("users.fields.email_verified")}
            content={data?.emailVerified ? "Yes" : "No"}
          />
          <ReadOnlyFormField
            label={translate("users.fields.phone_number_verified")}
            content={data?.phoneNumberVerified ? "Yes" : "No"}
          />
          <ReadOnlyFormField
            label={translate("users.fields.compte_pro_valide")}
            content={data?.compteProValide ? "Yes" : "No"}
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
        }}
        title={
          <Space>
            <DatabaseOutlined />
            <p>Informations Entreprise</p>
          </Space>
        }
        headStyle={{ padding: "1rem", border: "0.5px solid black" }}
        bodyStyle={{
          padding: "2rem",
          border: "0.5px solid black",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Card style={{ border: "none", width: "50%" }}>
          <ReadOnlyFormField
            label="Nom Entreprise"
            content={data?.additionalData?.nomEntreprise}
          />
          <ReadOnlyFormField
            label="Activité"
            content={data?.additionalData?.activite}
          />
          <ReadOnlyFormField
            label="Email Entreprise"
            content={data?.additionalData?.emailEntreprise}
          />
        </Card>
        <Card style={{ width: "50%", border: "none" }}>
          <ReadOnlyFormField
            label="Numéro Contribuable"
            content={data?.additionalData?.numeroContribuable}
          />
          <ReadOnlyFormField
            label="Type Entreprise"
            content={data?.additionalData?.typeEntreprise}
          />
          <ReadOnlyFormField
            label="Registre de Commerce"
            content={
              data?.additionalData?.registreCommerceId ? (
                <a
                  href={getApiFileUrl(data.additionalData.registreCommerceId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir le document
                </a>
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
        }}
        title={
          <Space>
            <DatabaseOutlined />
            <p>Informations Professionnel Particulier</p>
          </Space>
        }
        headStyle={{ padding: "1rem", border: "0.5px solid black" }}
        bodyStyle={{
          padding: "2rem",
          border: "0.5px solid black",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Card style={{ border: "none", width: "50%" }}>
          <ReadOnlyFormField
            label="Activité"
            content={data?.additionalData?.activite}
          />
          <ReadOnlyFormField
            label="Photo d'Identité"
            content={
              data?.additionalData?.photoIdentiteId ? (
                <a
                  href={getApiFileUrl(data.additionalData.photoIdentiteId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir le document
                </a>
              ) : (
                "Non fourni"
              )
            }
          />
        </Card>
        <Card style={{ width: "50%", border: "none" }}>
          <ReadOnlyFormField
            label="Pièce d'Identité"
            content={
              data?.additionalData?.pieceIdentiteId ? (
                <a
                  href={getApiFileUrl(data.additionalData.pieceIdentiteId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir le document
                </a>
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
        }}
        title={
          <Space>
            <DatabaseOutlined />
            <p>{translate("users.fields.wallet")}</p>
          </Space>
        }
        headStyle={{ padding: "1rem", border: "0.5px solid black" }}
        bodyStyle={{
          padding: "2rem",
          border: "0.5px solid black",
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

      <Card
        style={{
          display: "None",
          marginTop: "2rem",
        }}
        title={
          <Space>
            <DatabaseOutlined />
            <p>{translate("users.fields.user_transactions")}</p>
          </Space>
        }
        headStyle={{ padding: "1rem", border: "0.5px solid black" }}
        bodyStyle={{
          padding: "2rem",
          border: "0.5px solid black",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <ListUserTransactionsTable activeMenu={"customer"} filters={{}} />
      </Card>
    </>
  );
};
