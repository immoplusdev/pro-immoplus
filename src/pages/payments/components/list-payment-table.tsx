import {CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {BaseRecord, useTranslate} from "@refinedev/core";
import {DateField, FilterDropdown, List, useTable} from "@refinedev/antd";
import {Button, Select, Space, Table, Tag} from "antd";
import {Link} from "react-router-dom";
import {ArrowRightOutlined} from "@ant-design/icons";
import React from "react";
import {Amount} from "@/components/payments";
import {Payment} from "@/core/domain/payments/payment.model";
import {PaymentStatus} from "@/core/domain/payments";
import {StatusPaymentTag} from "./status-payment-tag";
import {enumToList} from "@/lib/ts-utilities";
import {SearchInput} from "@/components/filters";


type Props = {
    activeMenu: "all_e" | "factures" | "retraits",
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
        mode?: "server" | "off";
    },
}

export function ListPaymentTable({activeMenu, filters}: Props) {
    const translate = useTranslate();

    const {tableProps, setFilters, filters: searchFilters} = useTable<Payment>({
        resource: "payments",
        syncWithLocation: true,
        sorters: {
            initial: [{
                field: "createdAt",
                order: "desc"
            }]
        },
        filters
    });


    return (
        <List
            title={translate("pages.payment.title")}
            headerButtons={[
                <SearchInput setFilters={setFilters} filters={searchFilters}/>,
                <Link to="/payments">
                    <Button
                        type={activeMenu == "all_e" ? "primary" : "default"}
                    >
                        {translate("tags.all")}
                    </Button>
                </Link>,
                <Link to="/payments/factures">
                    <Button
                        type={activeMenu == "factures" ? "primary" : "default"}
                    >
                        {translate("pages.payment.common.factures")}
                    </Button>
                </Link>,
                <Link to="/payments/retraits">
                    <Button
                        type={activeMenu == "retraits" ? "primary" : "default"}
                    >
                        {translate("pages.payment.common.retraits")}
                    </Button>
                </Link>
            ]}
        >
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="collection"
                    title={translate("pages.payment.fields.collection")}
                    render={(value) => <Tag>{translate(`pages.payment.tags.${value}`)}</Tag>}
                    align="center"
                    sorter
                    filterDropdown={(props) => (
                        <FilterDropdown {...props}>
                            <Select
                                className={"w-full"}
                                mode="multiple"
                                placeholder={translate("common.select_a_value")}
                                options={enumToList(PaymentStatus).map((status) => ({
                                    label: translate(`pages.payment.tags.${status}`),
                                    value: status
                                }))}
                            />
                        </FilterDropdown>
                    )}
                />
                <Table.Column
                    dataIndex="paymentType"
                    title={translate("pages.payment.fields.payment_type")}
                    render={(value) => <Tag>{translate(`pages.payment.tags.${value}`)}</Tag>}
                    align="center"
                    sorter
                />
                <Table.Column
                    dataIndex="amountNoFees"
                    title={translate("pages.payment.fields.amount_no_fees")}
                    align="center"
                    render={(value) => <Amount value={value}/>}
                    sorter
                />
                <Table.Column
                    dataIndex="amount"
                    title={translate("pages.payment.fields.amount_with_fees")}
                    align="center"
                    render={(value) => <Amount value={value}/>}
                    sorter
                />
                <Table.Column
                    dataIndex="paymentMethod"
                    title={translate("pages.payment.fields.payment_method")}
                    render={(value) => <Tag>{translate(`pages.payment.tags.${value}`)}</Tag>}
                    align="center"
                    sorter
                />
                <Table.Column
                    dataIndex="paymentStatus"
                    title={translate("pages.payment.fields.payment_status")}
                    render={(value: PaymentStatus) => <StatusPaymentTag value={value}/>}
                    align="center"
                    sorter
                />
                <Table.Column
                    dataIndex="createdAt"
                    title={translate("pages.payment.fields.created_at")}
                    render={(value) => <DateField value={value}/>}
                    align="center"
                    sorter
                />
                <Table.Column
                    title={translate("table.actions")}
                    dataIndex="actions"
                    align="center"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <Link to={`/payments/edit/${record.id}`}>
                                <Button
                                    size="small"
                                    icon={<ArrowRightOutlined/>}

                                />
                            </Link>
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
