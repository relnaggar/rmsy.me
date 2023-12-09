import React, { useState, useCallback } from "react";
import { ReactComponent as RobotIcon } from "bootstrap-icons/icons/robot.svg";

import useFetch from "../hooks/useFetch";
import useInputControl from "../hooks/useInputControl";
import AddModal, { ModalProps } from "../common/AddModal";
import TextInput from "../common/TextInput";
import ErrorAlert from "../common/ErrorAlert";
import InputButton from "../common/InputActionButton";
import { JobUpload, JobDetails } from "./types";


interface AddJobModalProps extends ModalProps {
  addJob: (jobUpload: JobUpload) => void,  
};

const AddJobModal = ({
  show, setShow, errors, setErrors, showErrorAlert, setShowErrorAlert,
  addJob,
}: AddJobModalProps): React.JSX.Element => {
  const modalID = "addJobModal";
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
    setShowErrorAlert(false);

    const { url: urlError, ...newErrors } = errors;
    setErrors(newErrors);

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

    setErrors(newErrors);
    for (const input of [urlInput, titleInput, companyInput, postingInput]) {
      input.stopEditing();
    }
    
    return valid;
  }

  const handleValidatedSubmit = (): void => { 
    addJob({
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
    <AddModal
      show={show} setShow={setShow} errors={{error: errors["error"]}} setErrors={setErrors}
      showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert}
      title="Add Job" modalID={modalID} size="lg"
      onSubmit={handleSubmit}
      validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}
      submitDisabled={filling}      
    >
      <TextInput id={`${modalID}URL`}
        label="URL" type="url" value={urlInput.value} handleChange={urlInput.handleChange}
        editing={urlInput.editing} loading={filling} errors={errors["url"] || urlFillErrors}
      >
        <InputButton controlsId={`${modalID}URL`} label="Autofill Details" loading={filling}
          onClickAction={handleClickFillDetails} onClickCancel={handleClickCancelFill} icon={<RobotIcon />}
        />
      </TextInput>
      <ErrorAlert
        errors={nonURLFillErrors}
        showErrorAlert={showFillErrorAlert} setShowErrorAlert={setShowFillErrorAlert}
      />
      <hr />
      <h5>Details</h5>
      <TextInput id={`${modalID}Title`}
        label="Title" type="text" value={titleInput.value} handleChange={titleInput.handleChange}
        editing={titleInput.editing} loading={filling} errors={errors["title"]}
      />
      <TextInput id={`${modalID}Company`}
        label="Company" type="text" value={companyInput.value} handleChange={companyInput.handleChange}
        editing={companyInput.editing} loading={filling} errors={errors["company"]}
      />
      <TextInput id={`${modalID}Posting`}
        label="Posting" type="textarea" value={postingInput.value} handleChange={postingInput.handleChange}
        editing={postingInput.editing} loading={filling} errors={errors["posting"]}
      />
    </AddModal>
  );
};

export default AddJobModal;