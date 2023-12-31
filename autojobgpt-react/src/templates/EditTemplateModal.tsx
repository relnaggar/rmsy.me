import React, { useId } from "react";

import EditModal, { EditResourceModalProps } from "../common/EditModal";
import InputWithSave from "../common/InputWithSave";
import DefaultFillField from "./DefaultFillField";
import { DocumentsPageProps } from "../routes/DocumentsPage";
import { defaultFillFields } from "../api/constants";
import { FillField, Template } from '../api/types';
import { additionalInformationHelpText } from './helpText';
import ToggleInput from "../common/ToggleInput";


interface EditTemplateModalProps extends
  EditResourceModalProps<Template>,
  Pick<DocumentsPageProps, "documentTypeLabel">
{
  fillFields: FillField[],
  setFillFields: React.Dispatch<React.SetStateAction<FillField[]>>,
}

const EditTemplateModal = ({
  show, setShow, editId,
  fillFields, setFillFields,
  documentTypeLabel,
  ...resourceManager
}: EditTemplateModalProps): React.JSX.Element => {
  const modalId = useId();
  const template: Template | undefined = resourceManager.resources.find((template: Template) => template.id === editId);

  return (
    <EditModal title={`Edit ${documentTypeLabel} Template`} modalId={modalId} show={show} setShow={setShow} size="xl">
      <InputWithSave editId={editId} {...resourceManager}
        type="text" editableProperty="name" labelText={`${documentTypeLabel} Template Name`}
        required
      />
      <InputWithSave editId={editId} {...resourceManager}
        type="textarea" editableProperty="additional_information" labelText="Additional Information" helpText={additionalInformationHelpText}
      />
      <hr />
      <h5 className="mb-3">Fill Field Descriptions</h5>
      { template &&
        template.paragraphs.map((paragraph, index) =>
          paragraph === "" ?
            <br key={index} />
          :
            <p key={index}>
              {
                paragraph.split(/{{(.*?)}}/).map((part, partIndex) => {
                  const isFillField: boolean = partIndex % 2 !== 0;
                  let fillField: FillField | undefined = undefined;
                  if (isFillField) {
                    fillField = fillFields.find((fillField: FillField) =>
                      fillField.template === editId && fillField.key === part
                    );
                  }
                  return (
                    <React.Fragment key={partIndex}>
                      { isFillField ? (
                        <ToggleInput label={fillField!.key}>
                          { defaultFillFields.includes(fillField!.key) ?
                            <DefaultFillField key={fillField!.id} fillField={fillField!} />
                            :
                              <InputWithSave key={fillField!.id} editId={fillField!.id}
                                apiPath="fillFields/" resources={fillFields} setResources={setFillFields}
                                type="textarea" editableProperty="description" labelProperty="key"
                              />
                          }
                        </ToggleInput>
                        ) : (
                          part
                        )}                      
                    </React.Fragment>
                  );
                })
              }
            </p>
        )
      }
    </EditModal>
  )
};

export default EditTemplateModal;