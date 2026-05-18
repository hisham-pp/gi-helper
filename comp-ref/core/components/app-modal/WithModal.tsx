import React, { ComponentType } from 'react';
import { AppModalProps } from './types';
import AppModal from '.';

const withModal = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const WithModal: React.FC<P & AppModalProps> = (props) => {
    return (
      <AppModal {...props}>
        <WrappedComponent {...props} />
      </AppModal>
    );
  };

  return WithModal;
};

export default withModal;
