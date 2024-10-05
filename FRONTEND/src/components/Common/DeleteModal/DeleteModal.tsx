// import { Button } from "../../components/Button/Button";
import { Button } from "react-bootstrap";
// import "./DeleteModal.css";
import { ExclamationCircle } from "react-bootstrap-icons";
import Modal from 'react-bootstrap/Modal';

interface PropData {
  close: any;
  onDelete?: any;
  message?: any;
  isShow: any
}

const DeleteModal = (props: PropData) => {
  const onCancel = () => {
    props.close();
  };

  return (
    <>
      {
        props.isShow &&
        <Modal show={props.isShow} onHide={onCancel}
          {...props}
          aria-labelledby="contained-modal-title-vcenter"
          centered>
          <div className="delete-modal mt-4">
            <form>
              <div className="form-style text-center">
                <div className="text-center mb-3">
                  <ExclamationCircle size={40} className="text-danger" />
                </div>
                <div>
                  {props.message
                    ? props.message
                    : "Are you sure, you want to delete this record ?"}{" "}
                </div>
                <div className="d-flex justify-content-center mt-4 mb-4">
                  <Button className="btn-brand-1" onClick={() => props.onDelete()} id="popup-confirm-button">Yes</Button>
                  <span className="px-2"></span>
                  <Button className="btn-brand-1" onClick={() => onCancel()} id="popup-cancel-button">No</Button>
                </div>
              </div>
            </form>
          </div>
        </Modal>
      }
    </>
  );
};

export default DeleteModal;
