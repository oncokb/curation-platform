import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/shared/stores';

export interface IUserManagementDeleteDialogProps extends StoreProps, RouteComponentProps<{ login: string }> {}

export const UserManagementDeleteDialog = (props: IUserManagementDeleteDialogProps) => {
  useEffect(() => {
    props.getUser(props.match.params.login);
  }, []);

  const handleClose = event => {
    event.stopPropagation();
    props.history.push('/admin/user-management');
  };

  const confirmDelete = event => {
    props.deleteUser(props.user.login);
    handleClose(event);
  };

  const { user } = props;

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose}>Confirm delete operation</ModalHeader>
      <ModalBody>Are you sure you want to delete this User?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  user: storeState.userStore.entity,
  getUser: storeState.userStore.getEntity,
  deleteUser: storeState.userStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(UserManagementDeleteDialog);
