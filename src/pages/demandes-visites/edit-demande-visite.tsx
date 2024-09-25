import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import {Form, Col, Row } from "antd";
import { useTranslate } from "@refinedev/core";

import { DemandeVisiteEditActionFields } from "@/pages/demandes-visites/components/edit-actions-fields";
import { DemandeVisiteEditDataFields } from "@/pages/demandes-visites/components/edit-read-only-fields";

export const EditDemandeVisite: React.FC = () => {
  const translate = useTranslate();
  const { formProps, saveButtonProps, queryResult } = useForm();
  const demandesVisitesData = queryResult?.data?.data;

  return (
      <Edit saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
          <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
            <Col xs={24} md={24} lg={16}>
              <DemandeVisiteEditDataFields translate={translate} demandesVisitesData={demandesVisitesData} />
            </Col>
            <Col xs={24} md={24} lg={8}>
              <DemandeVisiteEditActionFields translate={translate} />
            </Col>
          </Row>
        </Form>
      </Edit>
  );
};



