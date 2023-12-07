import React, { useState, useCallback } from "react";
import { ReactComponent as RobotIcon } from "bootstrap-icons/icons/robot.svg";

import useFetch from "../hooks/useFetch";
import useFormInput from "../hooks/useFormInput";
import AddModal from "../common/AddModal";
import FormInput from "../common/FormInput";
import ErrorAlert from "../common/ErrorAlert";
import { JobUpload, JobDetails } from "./types";
import { ModalProps } from "../common/types";


interface AddJobModalProps extends ModalProps {
  addJob: (jobUpload: JobUpload) => void,  
};

const AddJobModal: (props: AddJobModalProps) => React.JSX.Element = ({
  show, setShow, errors, setErrors, showErrorAlert, setShowErrorAlert,
  addJob,
}) => {
  const modalID = "addJobModal";
  const urlInput = useFormInput();
  const titleInput = useFormInput();
  const companyInput = useFormInput();
  const postingInput = useFormInput();
  
  const [fillErrors, setFillErrors] = useState<Record<string,string>>({});
  const [showFillErrorAlert, setShowFillErrorAlert] = useState<boolean>(false);  
  const { url: urlFillErrors, ...nonURLFillErrors } = fillErrors;

  console.log("fillErrors");
  console.log(fillErrors);

  const onFillSuccess = useCallback((jobDetails: JobDetails) => {
    titleInput.edit(jobDetails.title);
    companyInput.edit(jobDetails.company);
    postingInput.edit(jobDetails.posting);
  }, [titleInput, companyInput, postingInput]);

  const onFillFail = useCallback((errors: Record<string,string>) => {
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

  const handleClickFillDetails = (): void => {
    setFillErrors({});
    setShowFillErrorAlert(false);
    setShowErrorAlert(false);

    if (urlInput.value === "") {
      setFillErrors({"url": "Please enter a URL."});
      urlInput.stopEditing();
    } else {      
      if ((document.getElementById(`${modalID}URL`) as HTMLInputElement).reportValidity()) {
        fill(`url=${urlInput.value}`);      
        urlInput.stopEditing();
      }
    }
  };

  const handleClickSubmit = (): void => {
    setShowFillErrorAlert(false);
    setFillErrors({});
  };

  const handleSuccessfulSubmit = (): void => { 
    addJob({
      url: urlInput.value,
      title: titleInput.value,
      company: companyInput.value,
      posting: postingInput.value,
    });
    for (const input of [urlInput, titleInput, companyInput, postingInput]) {
      input.stopEditing();
    }
  };

  const handleClickCancelFill = (): void => {
    cancelFill();
  };

  return (
    <AddModal
      show={show} setShow={setShow} errors={{error: errors["error"]}} setErrors={setErrors}
      showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert}
      title="Add Job" modalID={modalID} size="lg"
      onClickSubmit={handleClickSubmit}
      onSuccessfulSubmit={handleSuccessfulSubmit}
      submitDisabled={filling}      
    >
      <FormInput id={`${modalID}URL`}
        label="URL" type="url" value={urlInput.value} handleChange={urlInput.handleChange}
        editing={urlInput.editing} loading={filling} error={errors["url"] || urlFillErrors}
      >
        <button className="btn btn-outline-primary" type="button"
          onClick={filling ? handleClickCancelFill : handleClickFillDetails }
        >
          {filling?<>
            <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
            Cancel
          </>:<>
            <RobotIcon className="me-1" />
            Autofill Details
          </>}
        </button>
      </FormInput>
      <ErrorAlert
        errors={nonURLFillErrors}
        showErrorAlert={showFillErrorAlert} setShowErrorAlert={setShowFillErrorAlert}
      />
      <hr />
      <h5>Details</h5>
      <FormInput id={`${modalID}Title`}
        label="Title" type="text" value={titleInput.value} handleChange={titleInput.handleChange}
        editing={titleInput.editing} loading={filling} error={errors["title"]} required
      />
      <FormInput id={`${modalID}Company`}
        label="Company" type="text" value={companyInput.value} handleChange={companyInput.handleChange}
        editing={companyInput.editing} loading={filling} error={errors["company"]} required
      />
      <FormInput id={`${modalID}Posting`}
        label="Posting" type="textarea" value={postingInput.value} handleChange={postingInput.handleChange}
        editing={postingInput.editing} loading={filling} error={errors["posting"]} required
      />
    </AddModal>
  );
};

export default AddJobModal;