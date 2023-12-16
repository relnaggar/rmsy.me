import React, { useState, useCallback } from "react";
import { ReactComponent as RobotIcon } from "bootstrap-icons/icons/robot.svg";

import useFetch from "../hooks/useFetch";
import useInputControl from "../hooks/useInputControl";
import AddModal, { AddResourceModalProps } from "../common/AddModal";
import TextInput from "../common/TextInput";
import ErrorAlert from "../common/ErrorAlert";
import InputButton from "../common/InputActionButton";
import { JobUpload, JobDetails } from '../api/types';


const AddJobModal = ({
  postResource: postJob,
  ...addModal
}: AddResourceModalProps<JobUpload>): React.JSX.Element => {
  const modalId = "addJobModal";
  const urlInput = useInputControl();
  const titleInput = useInputControl();
  const companyInput = useInputControl();
  const postingInput = useInputControl();
  
  const [fillErrors, setFillErrors] = useState<Record<string,string[]>>({});
  const [showFillErrorAlert, setShowFillErrorAlert] = useState<boolean>(false);  
  const { url: urlFillErrors, ...nonURLFillErrors } = fillErrors;

  const onFillSuccess = useCallback((jobDetails: JobDetails) => {
    titleInput.edit(jobDetails.title);
    companyInput.edit(jobDetails.company);
    postingInput.edit(jobDetails.posting);
  }, [titleInput, companyInput, postingInput]);

  const onFillFail = useCallback((errors: Record<string,string[]>) => {
    setFillErrors(errors);
    if (Object.keys(errors).filter((key) => key !== "url").length > 0) {
      setShowFillErrorAlert(true);
    }
  }, []);

  const { fetching: filling, refetch: fill, cancel: cancelFill } = useFetch<JobDetails>(
    `jobs/extract-details-from-url`, {
    initialFetch: false,
    onSuccess: onFillSuccess,
    onFail: onFillFail,
  });

  const handleClickFillDetails = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setShowFillErrorAlert(false);
    addModal.setShowErrorAlert(false);

    const { url: urlError, ...newErrors } = addModal.errors;
    addModal.setErrors(newErrors);

    let valid = true;
    const newFillErrors: Record<string,string[]> = {};

    if (urlInput.value === "") {
      newFillErrors["url"] = ["Enter a URL."];
      valid = false;
    }

    setFillErrors(newFillErrors);
    urlInput.stopEditing();

    if (valid) {
      fill(`url=${urlInput.value}`);
    }
  };

  const handleSubmit = (): void => {
    setShowFillErrorAlert(false);
    setFillErrors({});
  };

  const validateSubmit = (): boolean => {
    let valid = true;
    const newErrors: Record<string,string[]> = {};

    if (titleInput.value === "") {
      newErrors["title"] = ["Enter a title."];
      valid = false;
    }

    if (companyInput.value === "") {
      newErrors["company"] = ["Enter a company."];
      valid = false;
    }

    if (postingInput.value === "") {
      newErrors["posting"] = ["Enter a posting."];
      valid = false;
    }

    addModal.setErrors(newErrors);
    for (const input of [urlInput, titleInput, companyInput, postingInput]) {
      input.stopEditing();
    }
    
    return valid;
  }

  const handleValidatedSubmit = (): void => { 
    postJob({
      url: urlInput.value,
      title: titleInput.value,
      company: companyInput.value,
      posting: postingInput.value,
    });
  };

  const handleClickCancelFill = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    cancelFill();
  };

  return (
    <AddModal modalId={modalId} {...addModal} 
      errors={{error: addModal.errors["error"]}}
      title="Add Job" size="lg"
      onSubmit={handleSubmit}
      validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}
      submitDisabled={filling}      
    >
      <TextInput id={`${modalId}URL`}
        value={urlInput.value} editing={urlInput.editing} handleChange={urlInput.handleChange}
        label="URL" type="url" loading={filling} errors={addModal.errors["url"] || urlFillErrors}
      >
        <InputButton controlsId={`${modalId}URL`} label="Autofill Details" loading={filling}
          onClickAction={handleClickFillDetails} onClickCancel={handleClickCancelFill} icon={<RobotIcon />}
        />
      </TextInput>
      <ErrorAlert
        errors={nonURLFillErrors} showErrorAlert={showFillErrorAlert} setShowErrorAlert={setShowFillErrorAlert}
      />
      <hr />
      <h5>Details</h5>
      <TextInput id={`${modalId}Title`}
        value={titleInput.value} editing={titleInput.editing} handleChange={titleInput.handleChange}
        label="Title" type="text" loading={filling} errors={addModal.errors["title"]}
      />
      <TextInput id={`${modalId}Company`}
        value={companyInput.value} editing={companyInput.editing} handleChange={companyInput.handleChange}
        label="Company" type="text" loading={filling} errors={addModal.errors["company"]}
      />
      <TextInput id={`${modalId}Posting`}
        value={postingInput.value} editing={postingInput.editing} handleChange={postingInput.handleChange}
        label="Posting" type="textarea" loading={filling} errors={addModal.errors["posting"]}
      />
    </AddModal>
  );
};

export default AddJobModal;