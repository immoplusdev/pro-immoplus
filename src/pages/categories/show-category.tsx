import React from "react";
import {
  IResourceComponentsProps,
  useShow,
  useTranslate,
  useMany,
} from "@refinedev/core";
import { Show, TagField, TextField } from "@refinedev/antd";
import { Col, Row, Tag, Typography } from "antd";

const { Title } = Typography;

export const CategoryShow: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const { data: subCategoriesData, isLoading: subCategoriesIsLoading } =
    useMany({
      resource: "sub_categories",
      ids: record?.sub_categories || [],
      queryOptions: {
        enabled: !!record && !!record?.sub_categories?.length,
      },
    });

  return (
    <Show isLoading={isLoading}>
      <Col>
        <Row align="stretch" justify="start" className="mb-4">
          <Col span={3} className="gutter-row">
            <Title level={5}>{translate("fields.name")}: </Title>
          </Col>
          <Col span={3}>
            <TextField value={record?.name} />
          </Col>
        </Row>
        <Row align="stretch" justify="start" className="mb-4">
          <Col span={3}>
            <Title level={5}>{translate("fields.payment_type")}: </Title>
          </Col>
          <Col span={3}>
            <Tag>
              {translate(
                `categories.fields.payment_types.${record?.payment_type}`,
                record?.payment_type
              )}
            </Tag>
          </Col>
        </Row>
        <Row align="stretch" justify="start" className="mb-4">
          <Col span={3}>
            <Title level={5}>{translate("fields.product_type")}: </Title>
          </Col>
          <Col span={3}>
            <Tag>
              {translate(
                `products.fields.product_types.${record?.product_type}`,
                record?.product_type
              )}
            </Tag>
          </Col>
        </Row>
      </Col>

      <Row align="stretch" justify="start" className="mb-4">
        <Col span={3}>
          <Title level={5}>{translate("fields.sub_categories")}: </Title>
        </Col>
        <Col span={10}>
          {subCategoriesIsLoading && record?.sub_categories?.length ? (
            <>...</>
          ) : (
            <>
              {record?.sub_categories?.length ? (
                subCategoriesData?.data?.map((sub_category: any) => (
                  <TagField
                    key={sub_category?.name}
                    value={sub_category?.name}
                  />
                ))
              ) : (
                <></>
              )}
            </>
          )}
        </Col>
      </Row>
    </Show>
  );
};
