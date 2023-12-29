import React, { useContext } from 'react';

import { ConfirmationModalContext } from "../routes/Layout";
import useAddModal from "../hooks/useAddModal";
import useEditModal from "../hooks/useEditModal";
import useErrorAlert from "../hooks/useErrorAlert";
import useFetchResource from "../hooks/useFetchResource";
import useResource from "../hooks/useResource";
import useFilterResource from "../hooks/useFilterResource";
import useDuplicate from '../hooks/useDuplicate';
import ErrorAlert from '../common/ErrorAlert';
import FilterResourceSelect from '../common/FilterResourceSelect';
import DocumentList from '../common/DocumentList';
import EditTailoredDocumentModal from './EditTailoredDocumentModal';
import AddTailoredDocumentModal from './AddTailoredDocumentModal';
import { Job, Substitution, TailoredDocument, TailoredDocumentUpload } from '../api/types';
import { DocumentsPageProps } from '../routes/DocumentsPage';


const getPlaceholderTailoredDocument = (tailoredDocumentUpload: TailoredDocumentUpload): TailoredDocument => {
  return {
    id: -1,
    substitutions: [],
    version: -1,
    docx: "",
    png: "",
    chat_messages: [],
    job: {
      id: tailoredDocumentUpload.job,
      url: "",
      title: "",
      company: "",
      posting: "",
      status: 1,
      chosen_resume: null,
    },
    template: {
      id: tailoredDocumentUpload.template,
      name: "",
      docx: "",
      png: "",
      fillFields: [],     
      type: tailoredDocumentUpload.type,
    },
    name: "",
    type: tailoredDocumentUpload.type,
    template_paragraphs: [],
  }
};

const TailoredDocumentList = ({
  documentType,
  documentTypeLabel,
}: DocumentsPageProps): React.JSX.Element => {
  const openConfirmationModal = useContext(ConfirmationModalContext);
  const addTailoredDocumentModal = useAddModal();
  const editTailoredDocumentModal = useEditModal();
  const errorAlert = useErrorAlert();

  const substitutionManager = useFetchResource<Substitution>("substitutions/", {
    onFail: errorAlert.showErrors
  });
  const { setResources: setSubstitutions } = substitutionManager;

  const handleAddTailoredDocumentSuccess = (tailoredDocument: TailoredDocument) => {
    addTailoredDocumentModal.handleAddSuccess();
    setSubstitutions((substitutions) => [...substitutions, ...tailoredDocument.substitutions]);
  };

  const tailoredDocumentManager = useResource<TailoredDocument,TailoredDocumentUpload>("tailoredDocuments/", getPlaceholderTailoredDocument, {
    fetchParamString: `type=${documentType}`,
    onFetchFail: errorAlert.showErrors,
    onPostSuccess: handleAddTailoredDocumentSuccess,
    onPostFail: addTailoredDocumentModal.handleAddFail,
    onDeleteFail: errorAlert.showErrors,
  });
  const {
    resources: tailoredDocuments,
    setResources: setTailoredDocuments,
    deleteResource: deleteTailoredDocument,
  } = tailoredDocumentManager;
  
  const handleClickEditTailoredDocument = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    editTailoredDocumentModal.open(id);
  };

  const handleClickRemoveTailoredDocument = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const tailoredDocument: TailoredDocument = tailoredDocuments.find((tailoredDocument) => tailoredDocument.id === id)!;
    openConfirmationModal(() => deleteTailoredDocument(id), `delete ${documentTypeLabel.toLowerCase()} "${tailoredDocument.name}"`, "Delete");
  };

  const handleClickAddTailoredDocument = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    addTailoredDocumentModal.open();
  }

  const handleSubstitutionSaveSuccess = (substitution: Substitution) => {
    setTailoredDocuments((tailoredDocuments) => tailoredDocuments.map((tailoredDocument) => {
      if (tailoredDocument.id === substitution.tailored_document) {
        const newTailoredDocument = {...tailoredDocument};
        newTailoredDocument.png = tailoredDocument.png.split("?")[0] + `?${Date.now()}`;
        return newTailoredDocument;
      } else {
        return tailoredDocument;
      }
    }));
  };

  const { filteredResources: filteredTailoredDocuments, ...filterTailoredDocumentManager} = useFilterResource<TailoredDocument, Job>(tailoredDocuments, "job");

  const { duplicate } = useDuplicate({
    apiPath: tailoredDocumentManager.apiPath, setResources: tailoredDocumentManager.setResources,
    ...errorAlert
  });

  const handleClickDuplicate = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const tailoredDocument: TailoredDocument = tailoredDocuments.find((tailoredDocument) => tailoredDocument.id === id)!;
    const tailoredDocumentUpload: TailoredDocumentUpload = {
      job: tailoredDocument.job!.id,
      template: tailoredDocument.template!.id,
      type: documentType,
    };
    duplicate(id, getPlaceholderTailoredDocument(tailoredDocumentUpload));
    editTailoredDocumentModal.close();
  }

  return(
    <section className="mt-3">
      <h2 className="mb-3">{documentTypeLabel}s</h2>
      <ErrorAlert {...errorAlert} />
      <FilterResourceSelect {...filterTailoredDocumentManager}
        filterByOptionToString={(job: Job) => `${job.title}, ${job.company}`}
        filterLabel="Filter by job:" defaultOptionLabel="All Jobs"
      />
      <DocumentList {...{...tailoredDocumentManager, resources: filteredTailoredDocuments }}
        onClickEditDocument={handleClickEditTailoredDocument}
        onClickRemoveDocument={handleClickRemoveTailoredDocument}
        onClickAddDocument={handleClickAddTailoredDocument}
        addButtonText={`Generate new ${documentTypeLabel.toLowerCase()}`}
      />
      <EditTailoredDocumentModal editId={editTailoredDocumentModal.editId}
        show={editTailoredDocumentModal.show}
        setShow={editTailoredDocumentModal.setShow} 
        apiPath={tailoredDocumentManager.apiPath}
        resources={tailoredDocumentManager.resources}
        setResources={tailoredDocumentManager.setResources}        
        substitutions={substitutionManager.resources} setSubstitutions={substitutionManager.setResources}
        onSubstitutionSaveSuccess={handleSubstitutionSaveSuccess}
        onClickDuplicate={handleClickDuplicate}
        documentTypeLabel={documentTypeLabel}
      />
      <AddTailoredDocumentModal {...addTailoredDocumentModal}
        postResource={tailoredDocumentManager.postResource}
        documentType={documentType}
        documentTypeLabel={documentTypeLabel}
      />
    </section>
  )
};

export default TailoredDocumentList;