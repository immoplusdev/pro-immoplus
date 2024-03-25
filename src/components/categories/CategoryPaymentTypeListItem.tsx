import { BaseRecord, useTranslate } from "@refinedev/core";
import { Table } from "antd";

export default function CategoryPaymentTypeListItem() {
  const translate = useTranslate();
  return (
    <Table.Column
      title={translate("fields.payment_type")}
      dataIndex="payment_type"
      render={(_, record: BaseRecord) => (
        <>
          {translate(
            `categories.payment_types.${record.payment_type}`,
            record.payment_type
          )}
        </>
      )}
    />
  );
}
