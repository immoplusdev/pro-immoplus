import React from "react";
import { BaseRecord, useTranslate } from "@refinedev/core";
import {
    useTable,
    List,
    EditButton,
    ShowButton,
    DeleteButton,
    EmailField,
    DateField,
    BooleanField,
} from "@refinedev/antd";
import {Table, Space, Button} from "antd";
import {Link} from "react-router-dom";
import type {CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {ArrowRightOutlined, EditOutlined, EyeOutlined} from "@ant-design/icons";


type Props = {
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
        mode?: "server" | "off";
    };
    activeMenu?: "all_e" | "pro_entreprise" | "pro_particulier" | "utilisateurs_valides" | "utilisateurs_non_valides" | "customer"
}
export const ListUsersTable = ({filters, activeMenu}: Props) => {
    const translate = useTranslate();
    const { tableProps } = useTable({
        syncWithLocation: true,
        resource: "users",
        sorters: {
            initial: [{
                field: "createdAt",
                order: "desc"
            }]
        },
        filters
    });

    return (
        <List title={translate("users.fields.users")}
              headerButtons={[
                  <Link to="/users">
                      <Button
                          type={activeMenu == "all_e" ? "primary" : "default"}
                      >
                          {translate("tags.all_e")}
                      </Button>
                  </Link>,
                  <Link to="/users/pro-entreprise">
                      <Button
                          type={activeMenu == "pro_entreprise" ? "primary" : "default"}
                      >
                          {translate("tags.pro_entreprise")}
                      </Button>
                  </Link>,
                  <Link to="/users/pro-particulier">
                      <Button
                          type={activeMenu == "pro_particulier" ? "primary" : "default"}
                      >
                          {translate("tags.pro_particulier")}
                      </Button>
                  </Link>,
                  <Link to="/users/utilisateurs-valides">
                      <Button
                          type={activeMenu == "utilisateurs_valides" ? "primary" : "default"}
                      >
                          {translate("tags.utilisateurs_valides")}
                      </Button>
                  </Link>,
                  <Link to="/users/utilisateurs-non-valides">
                      <Button
                          type={activeMenu == "utilisateurs_non_valides" ? "primary" : "default"}
                      >
                          {translate("tags.utilisateurs_non_valides")}
                      </Button>
                  </Link>,
                  <Link to="/users/customer">
                      <Button
                          type={activeMenu == "customer" ? "primary" : "default"}
                      >
                          {translate("tags.customer")}
                      </Button>
                  </Link>
              ]}
        >
            <Table {...tableProps} rowKey="id"

            >
                <Table.Column
                    dataIndex="lastName"
                    title={translate("users.fields.lastname")}
                    align="center"
                />
                <Table.Column
                    dataIndex="firstName"
                    title={translate("users.fields.firstname")}
                    align="center"
                />
                <Table.Column
                    dataIndex="status"
                    title={translate("users.fields.status")}
                    align="center"
                />
                <Table.Column
                    dataIndex={["role", "name"]}
                    title={translate("users.fields.role")}
                    align="center"
                />
                <Table.Column
                    dataIndex={["identityVerified"]}
                    title={translate("users.fields.identity_verified")}
                    render={(value: any) => <BooleanField value={value} />}
                    align="center"
                />
                <Table.Column
                    dataIndex={["emailVerified"]}
                    title={translate("users.fields.email_verified")}
                    render={(value: any) => <BooleanField value={value} />}
                    align="center"            />
                <Table.Column
                    dataIndex={["compteProValide"]}
                    title={translate("users.fields.compte_pro_valide")}
                    render={(value: any) => <BooleanField value={value} />}
                    align="center"
                />
                <Table.Column
                    title={translate("table.actions")}
                    dataIndex="actions"
                    align="center"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <Link to={`/users/edit/${record.id}`}>
                                <Button
                                    size="small"
                                    icon={<ArrowRightOutlined/>}

                                />
                            </Link>
                            {/*<Link to={`/users/show/${record.id}`}>*/}
                            {/*    <Button*/}
                            {/*        size="small"*/}
                            {/*        icon={<EyeOutlined/>}/>*/}
                            {/*</Link>*/}
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
