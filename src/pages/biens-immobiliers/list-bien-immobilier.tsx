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
    DateField, ImageField,
} from "@refinedev/antd";
import {Table, Space, Tag, Image} from "antd";
import {StatusValidationResidence} from "@/core/domain/residences";
import {StatusValidationResidenceTag} from "@/pages/residences/components";
import {getImageUrl} from "@/lib/helpers";

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
              align="center"
          />
          <Table.Column
              dataIndex="typeBienImmobilier"
              title={translate(
                  "biens-immobiliers.fields.type_bien_immobilier",
              )}
              render={(value: string) => <Tag>{value}</Tag>}
              align="center"
          />
          <Table.Column
              dataIndex="description"
              title={translate("fields.description")}
              align="center"
          />

          <Table.Column
              dataIndex="images"
              title={translate("fields.images")}
              align="center"
              render={(value: any[]) => (
                  <>
                    {value?.map((item) => (
                        <Image src={item}/>
                    ))}
                  </>
              )}
          />
          <Table.Column
              dataIndex="adresse"
              title={translate("fields.adresse")}
              align="center"
          />

          <Table.Column
              dataIndex="statusValidation"
              title={translate("fields.status_validation")}
              align="center"
              render={(value: StatusValidationResidence) => <StatusValidationResidenceTag
                  statusValidation={value}/>}
          />
          <Table.Column
              dataIndex="prix"
              align="center"
              title={translate("biens-immobiliers.fields.prix")}
          />
            <Table.Column
                dataIndex="typeLocation"
                title={translate("biens-immobiliers.fields.type_location")}
                align="center"
            />
            <Table.Column
                dataIndex="nombreMaxOccupants"
                title={translate(
                    "residences.fields.nombre_max_occupants",
                )}
                align="center"
            />

            <Table.Column
                dataIndex={["aLouer"]}
                title={translate("biens-immobiliers.fields.a_louer")}
                render={(value: any) => <BooleanField value={value} />}
                align="center"
            />
            <Table.Column
                dataIndex={["bienImmobilierDisponible"]}
                title={translate(
                    "biens-immobiliers.fields.disponible",
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
