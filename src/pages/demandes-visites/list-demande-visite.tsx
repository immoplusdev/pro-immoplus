import React from "react";
import { BaseRecord, useTranslate } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  BooleanField,
} from "@refinedev/antd";
import {Table, Space, Button} from "antd";
import {Link} from "react-router-dom";
import {ArrowRightOutlined} from "@ant-design/icons";
import {
    StatusValidationDemandeVisiteTag
} from "@/pages/demandes-visites/components/status-validation-demande-visite-tag";

export const ListDemandeVisites = () => {
  const translate = useTranslate();
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
      <List>
        <Table {...tableProps} rowKey="id">
            <Table.Column
                dataIndex="clientPhoneNumber"
                title={translate(
                    "demandes_visites.fields.client_phone_number",
                )}
                align="center"
            />
            <Table.Column
                dataIndex="notes"
                title={translate("demandes_visites.fields.notes")}
                align="center"
            />
            <Table.Column
                dataIndex="typeDemandeVisite"
                title={translate(
                    "demandes_visites.fields.type_demande_visite",
                )}
                render={(value) => <span>{translate(`demandes_visites.fields.${value}`)}</span>}
                align="center"
            />
          <Table.Column
              dataIndex="statusDemandeVisite"
              title={translate(
                  "demandes_visites.fields.status_demande_visite",
              )}
              render={(value) => <StatusValidationDemandeVisiteTag statusValidation={value}/> }
              align="center"
          />
          <Table.Column
              dataIndex="statusFacture"
              title={translate("demandes_visites.fields.status_facture")}
              align="center"
              render={(value) => <span>{translate(`demandes_visites.fields.${value}`)}</span>}
          />
          <Table.Column
              dataIndex={["retraitProEffectue"]}
              title={translate(
                  "demandes_visites.fields.retrait_pro_effectue",
              )}
              render={(value: any) => <BooleanField value={value} />}
              align="center"
          />

          <Table.Column
              title={translate("table.actions")}
              dataIndex="actions"
              align="center"
              render={(_, record: BaseRecord) => (
                  <Space>
                      <Link to={`/demandes-visites/edit/${record.id}`}>
                          <Button
                              size="small"
                              icon={<ArrowRightOutlined/>}

                          />
                      </Link>
                    {/*<ShowButton*/}
                    {/*    hideText*/}
                    {/*    size="small"*/}
                    {/*    recordItemId={record.id}*/}
                    {/*/>*/}
                    <DeleteButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                    />
                  </Space>
              )}
          />
        </Table>
      </List>
  );
};
