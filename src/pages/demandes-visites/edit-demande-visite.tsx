import React from "react";
import {DeleteButton, Edit, useForm} from "@refinedev/antd";
import {Form, Col, Row, Space, Button} from "antd";
import {useTranslate} from "@refinedev/core";
import { DemandeVisiteEditActionFields } from "@/pages/demandes-visites/components/edit-actions-fields";
import { DemandeVisiteEditDataFields } from "@/pages/demandes-visites/components/edit-read-only-fields";
import {OrderedListOutlined, ReloadOutlined, SaveOutlined} from "@ant-design/icons";
import {useNavigate, useLocation} from "react-router-dom";

export const EditDemandeVisite: React.FC = () => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => navigate((location.state as any)?.from || -1);
  const { formProps, saveButtonProps, queryResult, form } = useForm({
      redirect: false,
      onMutationSuccess: goBack,
  });
  const demandesVisitesData = queryResult?.data?.data;

  return (
      <Edit
          title={`${translate(`actions.edit`)} Demandes visites`}
          saveButtonProps={saveButtonProps}
          // breadcrumb={<Breadcrumb separator="/" items={[
          //   {title: "Demandes visites", href: '/demandes-visites'},
          //   {title: translate('actions.edit')}
          // ]}/>}
          headerButtons={
            <Space>
              <Button
                  icon={<OrderedListOutlined/>}
                  onClick={goBack}
              >
                Demandes visites
              </Button>
              <Button
                  icon={<ReloadOutlined/>}
                  onClick={() => form?.resetFields()}
              >
                Refresh
              </Button>
              <DeleteButton
                  recordItemId={demandesVisitesData?.id}
                  onSuccess={goBack}
              />
              <Button
                  type="primary"
                  icon={<SaveOutlined/>}
                  {...saveButtonProps}
              >
                {translate("buttons.save")}
              </Button>
            </Space>
          }
      >
        <Form {...formProps} layout="vertical">
          <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
            <Col xs={24} md={24} lg={16}>
              <DemandeVisiteEditDataFields translate={translate} demandesVisitesData={demandesVisitesData} />
            </Col>
            <Col xs={24} md={24} lg={8}>
              <DemandeVisiteEditActionFields translate={translate} id={demandesVisitesData?.id}/>
            </Col>
          </Row>
        </Form>
      </Edit>
  );
};



