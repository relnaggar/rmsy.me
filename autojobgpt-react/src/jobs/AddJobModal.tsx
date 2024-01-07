import React, { useState, useId } from "react";
import { ReactComponent as RobotIcon } from "bootstrap-icons/icons/robot.svg";

import useFetch from "../hooks/useFetch";
import useInputControl from "../hooks/useInputControl";
import AddModal, { AddResourceModalProps } from "../common/AddModal";
import BaseInput from "../common/BaseInput";
import ErrorAlert from "../common/ErrorAlert";
import InputButton from "../common/InputActionButton";
import { JobUpload, JobDetails } from '../api/types';


const AddJobModal = ({
  postResource: postJob,
  ...addModal
}: AddResourceModalProps<JobUpload>): React.JSX.Element => {
  const modalId = useId();
  const urlInput = useInputControl("url");
  const titleInput = useInputControl("title");
  const companyInput = useInputControl("company");
  const postingInput = useInputControl("posting");
  const notesInput = useInputControl("notes");
  
  const [fillErrors, setFillErrors] = useState<Record<string,string[]>>({});
  const [showFillErrorAlert, setShowFillErrorAlert] = useState<boolean>(false);  
  const { url: urlFillErrors, ...nonURLFillErrors } = fillErrors;

  const onFillSuccess = (jobDetails: JobDetails) => {
    titleInput.edit(jobDetails.title);
    companyInput.edit(jobDetails.company);
    postingInput.edit(jobDetails.posting);
  };

  const onFillFail = (errors: Record<string,string[]>) => {
    setFillErrors(errors);
    if (Object.keys(errors).filter((key) => key !== "url").length > 0) {
      setShowFillErrorAlert(true);
    }
  };

  const { fetching: filling, refetch: fill, cancel: cancelFill } = useFetch<JobDetails>(
    `jobs/extractDetailsFromUrl`, {
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
      newFillErrors[urlInput.name] = ["Enter a URL."];
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
      newErrors[titleInput.name] = ["Title is required."];
      valid = false;
    }

    if (companyInput.value === "") {
      newErrors[companyInput.name] = ["Company is required."];
      valid = false;
    }

    if (postingInput.value === "") {
      newErrors[postingInput.name] = ["Posting is required."];
      valid = false;
    }

    addModal.setErrors(newErrors);
    for (const input of [urlInput, titleInput, companyInput, postingInput, notesInput]) {
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
      notes: notesInput.value,
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
      <BaseInput name={urlInput.name}
        value={urlInput.value} editing={urlInput.editing} handleChange={urlInput.handleChange}
        label="URL" type="url" loading={filling} errors={addModal.errors[urlInput.name] || urlFillErrors}
      >
        <InputButton controlsId={`${modalId}URL`} label="Autofill Details" loading={filling}
          onClickAction={handleClickFillDetails} onClickCancel={handleClickCancelFill} icon={<RobotIcon />}
        />
      </BaseInput>
      <ErrorAlert
        errors={nonURLFillErrors} showErrorAlert={showFillErrorAlert} setShowErrorAlert={setShowFillErrorAlert}
      />
      <hr />
      <h5>Details</h5>
      <BaseInput ref={titleInput.ref} name={titleInput.name}
        value={titleInput.value} editing={titleInput.editing} handleChange={titleInput.handleChange}
        label="Title" type="text" loading={filling} errors={addModal.errors[titleInput.name]}
      />
      <BaseInput ref={companyInput.ref} name={companyInput.name}
        value={companyInput.value} editing={companyInput.editing} handleChange={companyInput.handleChange}
        label="Company" type="text" loading={filling} errors={addModal.errors[companyInput.name]}
      />
      <BaseInput ref={notesInput.ref} name={notesInput.name}
        value={notesInput.value} editing={notesInput.editing} handleChange={notesInput.handleChange}
        label="Notes" type="textarea" errors={addModal.errors[notesInput.name]}
      />
      <BaseInput ref={postingInput.ref} name={postingInput.name}
        value={postingInput.value} editing={postingInput.editing} handleChange={postingInput.handleChange}
        label="Posting" type="textarea" loading={filling} errors={addModal.errors[postingInput.name]}
      />
    </AddModal>
  );
};

export default AddJobModal;