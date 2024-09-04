import React from "react";
import { BaseRecord, useTranslate } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  TagField,
  BooleanField,
  DateField,
} from "@refinedev/antd";
import {Table, Space, Tag} from "antd";
import {StatusValidationResidence} from "@/core/domain/residences";
import {StatusValidationResidenceTag} from "@/pages/residences/components";

export const ListBienImmobiliers = () => {
  const translate = useTranslate();
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
      <List>
        <Table {...tableProps} rowKey="id">
          <Table.Column
              dataIndex="nom"
              title={translate("fields.nom")}
          />
          <Table.Column
              dataIndex="typeBienImmobilier"
              title={translate(
                  "biens-immobiliers.fields.type_bien_immobilier",
              )}
              render={(value: string) => <Tag>{value}</Tag>}
          />
          <Table.Column
              dataIndex="description"
              title={translate("fields.description")}
          />

          <Table.Column
              dataIndex="images"
              title={translate("fields.images")}
              render={(value: any[]) => (
                  <>
                    {value?.map((item) => (
                        <TagField value={item} key={item} />
                    ))}
                  </>
              )}
          />
          <Table.Column
              dataIndex="adresse"
              title={translate("fields.adresse")}
          />

          <Table.Column
              dataIndex="statusValidation"
              title={translate("fields.status_validation")}
              render={(value: StatusValidationResidence) => <StatusValidationResidenceTag
                  statusValidation={value}/>}
          />
          <Table.Column
              dataIndex="prix"
              title={translate("biens-immobiliers.fields.prix")}
          />

          <Table.Column
              dataIndex={["featured"]}
              title={translate("biens-immobiliers.fields.featured")}
              render={(value: any) => <BooleanField value={value} />}
          />
          <Table.Column
              dataIndex={["aLouer"]}
              title={translate("biens-immobiliers.fields.a_louer")}
              render={(value: any) => <BooleanField value={value} />}
          />
          <Table.Column
              dataIndex="typeLocation"
              title={translate("biens-immobiliers.fields.type_location")}
          />
          <Table.Column
              dataIndex={["bienImmobilierDisponible"]}
              title={translate(
                  "biens-immobiliers.fields.disponible",
              )}
              render={(value: any) => <BooleanField value={value} />}
          />
          <Table.Column
              dataIndex="nombreMaxOccupants"
              title={translate(
                  "residences.fields.nombre_max_occupants",
              )}
          />
          <Table.Column
              dataIndex={["animauxAutorises"]}
              title={translate(
                  "residences.fields.animaux_autorises",
              )}
              render={(value: any) => <BooleanField value={value} />}
          />
          <Table.Column
              dataIndex={["fetesAutorises"]}
              title={translate("residences.fields.fetes_autorises")}
              render={(value: any) => <BooleanField value={value} />}
          />
          <Table.Column
              dataIndex="reglesSupplementaires"
              title={translate(
                  "fields.regles_supplementaires",
              )}
          />
          <Table.Column
              dataIndex={["createdAt"]}
              title={translate("fields.created_at")}
              render={(value: any) => <DateField value={value} />}
          />
          <Table.Column
              title={translate("table.actions")}
              dataIndex="actions"
              render={(_, record: BaseRecord) => (
                  <Space>
                    <EditButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                    />
                    <ShowButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                    />
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
