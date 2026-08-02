import {BaseRecord, useTranslate} from "@refinedev/core";
import {
    useTable,
    List,
    DeleteButton,
} from "@refinedev/antd";
import {Table, Space, Button} from "antd";
import {Link} from "react-router-dom";
import type {CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {ArrowRightOutlined, EyeOutlined} from "@ant-design/icons";
import {SearchInput} from "@/components/filters";
import {DateDisplayField, OutlineTag, VerificationBadge} from "@/components/table";
import {formatAmount} from "@/lib/helpers";
import {WithdrawalRequestTabs} from "./withdrawal-request-tabs";

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

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
                return "#B86B0A";
            case "APPROVED":
                return "#1F8A5B";
            case "REJECTED":
                return "#C13838";
            case "PROCESSING":
                return "#185FA5";
            default:
                return TEXT_SECONDARY;
        }
    };

    const getOperatorColor = () => TEXT_SECONDARY;

    return (
        <>
            <WithdrawalRequestTabs activeMenu={activeMenu ?? "all"} />
            <List title={translate("withdrawalRequests.title")}
                  headerButtons={[
                      <SearchInput
                          setFilters={setFilters}
                          tableQuery={tableQuery}
                      />,
                  ]}
            >
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex={["owner", "firstName"]}
                    title={translate("withdrawalRequests.fields.owner")}
                    align="center"
                    render={(_, record: BaseRecord) => (
                        <span>
                            <Link to={`/users/edit/${record.owner}`}>
                                <EyeOutlined/> Voir detail
                            </Link>
                        </span>
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
                        <OutlineTag color={getOperatorColor()}>
                           {value}
                        </OutlineTag>
                    )}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="status"
                    title={translate("withdrawalRequests.fields.status")}
                    render={(value: string) => (
                        <OutlineTag color={getStatusColor(value)}>
                            {translate(`withdrawalRequests.status.${value.toLowerCase()}`)}
                        </OutlineTag>
                    )}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="retraitQr"
                    title={translate("withdrawalRequests.fields.retraitQr")}
                    render={(value: boolean) => <VerificationBadge verified={!!value}/>}
                    align="center"
                />
                <Table.Column
                    dataIndex="qrAutoApproved"
                    title={translate("withdrawalRequests.fields.qrAutoApproved")}
                    render={(value: boolean) => <VerificationBadge verified={!!value}/>}
                    align="center"
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
                                    style={{background: "#FFFFFF", border: `1px solid ${BORDER_COLOR}`, color: TEXT_SECONDARY}}
                                />
                            </Link>
                            <Link to={`/withdrawal-requests/show/${record.id}`}>
                                <Button
                                    size="small"
                                    icon={<EyeOutlined/>}
                                    style={{background: "#FFFFFF", border: `1px solid ${BORDER_COLOR}`, color: TEXT_SECONDARY}}
                                />
                            </Link>
                            <DeleteButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                                style={{background: "#FFFFFF", border: "1px solid #C13838", color: "#C13838"}}
                            />
                        </Space>
                    )}
                />
            </Table>
            </List>
        </>
    );
};

export default ListWithdrawalRequestTable;