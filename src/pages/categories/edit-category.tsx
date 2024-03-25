import React from "react";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Col, Row } from "antd";
import { categoryPaymentTypes } from "@/core/domain/categories/category.data";
import { productTypes } from "@/core/domain/products/product.data";

export const CategoryEdit: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { formProps, saveButtonProps, queryResult } = useForm();

  const categoriesData = queryResult?.data?.data;

  const { selectProps: subCategoriesSelectProps } = useSelect({
    resource: "sub_categories",
    defaultValue: categoriesData?.sub_categories,
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Row justify="start" align="middle" gutter={16}>
          <Col span={10}>
            <Form.Item
              label={translate("fields.name")}
              name={["name"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              label={translate("fields.payment_type")}
              name={["payment_type"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                options={categoryPaymentTypes.map((categoryPaymentType) => ({
                  label: translate(
                    `categories.fields.payment_types.${categoryPaymentType}`,
                    categoryPaymentType
                  ),
                  value: categoryPaymentType,
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={10}>
            <Form.Item
              label={translate("fields.product_type")}
              name={["product_type"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                options={productTypes.map((productType) => ({
                  label: translate(
                    `products.fields.product_types.${productType}`,
                    productType
                  ),
                  value: productType,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              label={translate("fields.sub_categories")}
              name={"sub_categories"}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select mode="multiple" {...subCategoriesSelectProps} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
