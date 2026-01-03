import {BaseRecord, useTranslate} from "@refinedev/core";
import {
    useTable,
    List,
    DeleteButton,
} from "@refinedev/antd";
import {Table, Space, Button, Tag} from "antd";
import {Link} from "react-router-dom";
import type {CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {ArrowRightOutlined, EyeOutlined} from "@ant-design/icons";
import {SearchInput} from "@/components/filters";
import {DateDisplayField} from "@/components/table";
import {formatAmount} from "@/lib/helpers";

type Props = {
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
        mode?: "server" | "off";
    };
    activeMenu?: "all" | "pending" | "approved" | "rejected" | "processing";
}

export const ListWithdrawalRequestTable = ({filters, activeMenu}: Props) => {
    const translate = useTranslate();
    const {tableProps, setFilters, tableQuery} = useTable({
        syncWithLocation: true,
        resource: "withdrawal-requests",
        sorters: {
            initial: [{
                field: "createdAt",
                order: "desc"
            }]
        },
        filters,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "orange";
            case "APPROVED":
                return "green";
            case "REJECTED":
                return "red";
            case "PROCESSING":
                return "blue";
            default:
                return "default";
        }
    };

    const getOperatorColor = (operator: string) => {
        switch (operator) {
            case "ORANGE_MONEY":
                return "orange";
            case "MTN_MONEY":
                return "yellow";
            case "MOOV_MONEY":
                return "blue";
            case "WAVE":
                return "purple";
            default:
                return "default";
        }
    };

    return (
        <List title={translate("withdrawalRequests.title")}
              headerButtons={[
                  <SearchInput
                      setFilters={setFilters}
                      tableQuery={tableQuery}
                  />,
                  <Link to="/withdrawal-requests">
                      <Button
                          type={activeMenu == "all" ? "primary" : "default"}
                      >
                          {translate("tags.all_e")}
                      </Button>
                  </Link>
              ]}
        >
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex={["owner", "firstName"]}
                    title={translate("withdrawalRequests.fields.owner")}
                    align="center"
                    render={(_, record: BaseRecord) => (
                        <span><Link to={`/users/edit/${record.owner}`}>{record.owner}</Link></span>
                    )}
                    sorter={true}
                />
                <Table.Column
                    dataIndex="amount"
                    title={translate("withdrawalRequests.fields.amount")}
                    render={(value: number, record: BaseRecord) => (
                        <span>{formatAmount(value)}</span>
                    )}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="phoneNumber"
                    title={translate("withdrawalRequests.fields.phoneNumber")}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="operator"
                    title={translate("withdrawalRequests.fields.operator")}
                    render={(value: string) => (
                        <Tag color={getOperatorColor(value)}>
                           {value}
                        </Tag>
                    )}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="status"
                    title={translate("withdrawalRequests.fields.status")}
                    render={(value: string) => (
                        <Tag color={getStatusColor(value)}>
                            {translate(`withdrawalRequests.status.${value.toLowerCase()}`)}
                        </Tag>
                    )}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="createdAt"
                    title={translate("fields.created_at")}
                    render={(date: string) => <DateDisplayField value={date}/>}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    title={translate("table.actions")}
                    dataIndex="actions"
                    align="center"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <Link to={`/withdrawal-requests/edit/${record.id}`}>
                                <Button
                                    size="small"
                                    icon={<ArrowRightOutlined/>}
                                />
                            </Link>
                            <Link to={`/withdrawal-requests/show/${record.id}`}>
                                <Button
                                    size="small"
                                    icon={<EyeOutlined/>}
                                />
                            </Link>
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

export default ListWithdrawalRequestTable;