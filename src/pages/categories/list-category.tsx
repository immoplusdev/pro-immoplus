import React from "react";
import {
  IResourceComponentsProps,
  BaseRecord,
  useTranslate,
  useMany,
} from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
} from "@refinedev/antd";
import { Table, Space, Tag, Image } from "antd";
import { getImageUrl } from "@/libs/helpers/url.helper";

export const CategoryList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title={translate("fields.thumb")}
          dataIndex="thumb"
          render={(_, record: BaseRecord) => (
            <Image width={50} height={50} src={getImageUrl(record.thumb)} />
          )}
        />
        <Table.Column dataIndex="name" title={translate("fields.name")} />

        <Table.Column
          title={translate("fields.payment_type")}
          dataIndex="payment_type"
          render={(_, record: BaseRecord) => (
            <Tag>
              {translate(
                `categories.fields.payment_types.${record.payment_type}`,
                record.payment_type
              )}
            </Tag>
          )}
        />
        <Table.Column
          title={translate("fields.payment_type")}
          dataIndex="payment_type"
          render={(_, record: BaseRecord) => (
            <Tag>
              {translate(
                `categories.fields.payment_types.${record.payment_type}`,
                record.payment_type
              )}
            </Tag>
          )}
        />
        <Table.Column
          title={translate("fields.product_type")}
          dataIndex="product_type"
          render={(_, record: BaseRecord) => (
            <>
              <Tag>
                {translate(
                  `products.fields.product_types.${record.product_type}`,
                  record.payment_type
                )}
              </Tag>
            </>
          )}
        />
        <Table.Column
          title={translate("table.actions")}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
