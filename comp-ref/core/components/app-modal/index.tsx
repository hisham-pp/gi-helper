import Modal from '@mui/material/Modal';
import { ModalMain } from './styled-components';
import { AppModalProps } from './types';

const AppModal: React.FC<AppModalProps> = ({ open, onClose, children, containerProps }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalMain {...containerProps}>{children}</ModalMain>
    </Modal>
  );
};

export default AppModal;
